'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { invitationFromLinkCookie, isExpired } from '@/lib/invitation';
import { checkIdentity, verifyFieldsFor } from '@/lib/identity';
import { resolveForm } from '@/lib/forms';
import { startSession, clientInfo } from '@/lib/session';
import { audit } from '@/lib/audit';
import { allow } from '@/lib/ratelimit';
import { setDisposition } from '@/lib/outreach';
import { LOCK_MINUTES, MAX_VERIFY_FAILS } from '@/lib/config';
import type { IdentityField } from '@/lib/crypto';
import { t } from '@/lib/lang';

export type VerifyState = { error?: string };

export async function verify(_prev: VerifyState, form: FormData): Promise<VerifyState> {
  const inv = await invitationFromLinkCookie();
  if (!inv) redirect('/not-found');
  if (isExpired(inv)) redirect('/expired');
  const { ip, userAgent } = await clientInfo();
  const { s } = await t();
  if (!allow(`verify:ip:${ip}`, 20) || !allow(`verify:inv:${inv.id}`, 10))
    return { error: s.verify.tooFast };
  if (inv.lockedUntil && inv.lockedUntil > new Date())
    return { error: s.verify.locked(LOCK_MINUTES) };

  // The member actually interacted (bots never submit this form).
  if (!inv.firstOpenedAt) {
    await prisma.invitation.update({ where: { id: inv.id }, data: { firstOpenedAt: new Date() } });
    await audit('opened', inv.id, { ip, userAgent });
  }

  const fields = await verifyFieldsFor(inv.member.state);
  const ok = checkIdentity(inv.member, fields, (f: IdentityField) => String(form.get(f) ?? ''));
  if (!ok) {
    const failed = inv.failedAttempts + 1;
    const locked = failed >= MAX_VERIFY_FAILS;
    await prisma.invitation.update({
      where: { id: inv.id },
      data: { failedAttempts: locked ? 0 : failed, lockedUntil: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    });
    await audit(locked ? 'locked' : 'verify_fail', inv.id, { ip, userAgent, detail: { failed } });
    return {
      error: locked
        ? s.verify.locked(LOCK_MINUTES)
        : s.verify.noMatch,
    };
  }

  await prisma.invitation.update({
    where: { id: inv.id },
    data: { failedAttempts: 0, lockedUntil: null, verifiedAt: inv.verifiedAt ?? new Date() },
  });
  await audit('verify_ok', inv.id, { ip, userAgent });

  // Pick the member's form now and pin its version for the rest of this assessment.
  if (!inv.assessment) {
    const q = await resolveForm(inv.member);
    if (!q) redirect('/goodbye?reason=no_form');
    await prisma.assessment.create({
      data: { invitationId: inv.id, questionnaireId: q.id, questionnaireVersion: q.version, completionMethod: 'self_web' },
    });
  } else if (['declined', 'reported_complete', 'partial'].includes(inv.assessment.status)) {
    // The member came back on their own: reopen the same pinned assessment.
    await prisma.assessment.update({
      where: { id: inv.assessment.id },
      data: { status: 'in_progress', outcomeReason: null, recheckAt: null, completedAt: null, missingRequired: [] },
    });
  }
  if (inv.assessment?.status !== 'completed') await setDisposition(inv.id, 'engaged');

  await startSession(inv.id);
  (await cookies()).delete('inv');
  redirect(inv.assessment?.status === 'completed' ? '/done' : '/q');
}
