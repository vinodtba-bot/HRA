'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { invitationFromLinkCookie } from '@/lib/invitation';
import { enqueueSend } from '@/lib/jobs';
import { audit } from '@/lib/audit';
import { clientInfo } from '@/lib/session';
import { MAX_RELINKS_PER_DAY } from '@/lib/config';

/** Reissues a code to the phone on file (never a typed-in number) and revokes earlier codes. */
export async function relink() {
  const inv = await invitationFromLinkCookie();
  if (!inv) redirect('/not-found');
  const today = new Date().toISOString().slice(0, 10);
  const count = inv.relinkDay === today ? inv.relinksToday : 0;
  if (count >= MAX_RELINKS_PER_DAY) redirect('/expired?limit=1');
  await prisma.invitation.update({ where: { id: inv.id }, data: { relinkDay: today, relinksToday: count + 1 } });
  await enqueueSend({ invitationId: inv.id, kind: 'relink' });
  const { ip, userAgent } = await clientInfo();
  await audit('relinked', inv.id, { ip, userAgent });
  redirect('/expired?sent=1');
}
