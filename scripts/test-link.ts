// Prints a fresh check-in link for one member, without sending a text. For testing only:
// it rotates the member's link, so any link already texted to them stops working.
// Usage: npm run test-link -- ME0001
import { prisma } from '../src/lib/db';
import { hashCode, newCode } from '../src/lib/crypto';
import { linkBase } from '../src/lib/config';
import { audit } from '../src/lib/audit';

(async () => {
  const planMemberId = process.argv[2];
  if (!planMemberId) throw new Error('usage: npm run test-link -- <plan_member_id>');
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_LINKS !== '1')
    throw new Error('test links are disabled in production');
  const inv = await prisma.invitation.findFirst({
    where: { member: { planMemberId } },
    orderBy: { createdAt: 'desc' },
    include: { campaign: true },
  });
  if (!inv) throw new Error(`no invitation for ${planMemberId}; import the member first`);
  const code = newCode();
  await prisma.invitation.update({
    where: { id: inv.id },
    data: {
      tokenHash: hashCode(code),
      prevTokenHash: null,
      revokedAt: null,
      lockedUntil: null,
      failedAttempts: 0,
      expiresAt: new Date(Date.now() + inv.campaign.linkTtlDays * 86400_000),
    },
  });
  await audit('relinked', inv.id, { actor: 'test-link script' });
  console.log(`${linkBase()}/r/${code}`);
})()
  .catch(e => { console.error(e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
