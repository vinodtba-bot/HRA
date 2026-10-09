'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { currentInvitation } from '@/lib/invitation';
import { resolveForm } from '@/lib/forms';
import { audit } from '@/lib/audit';
import { setDisposition } from '@/lib/outreach';
import { clientInfo, endSession } from '@/lib/session';
import { RECHECK_DAYS } from '@/lib/config';

const REASONS = ['not_interested', 'no_time', 'privacy', 'prefer_phone', 'other'];

/** Sets a documented outcome on the member's assessment, creating one on the assigned form if none exists yet. */
async function setOutcome(status: 'declined' | 'reported_complete', extra: { outcomeReason?: string | null; recheckAt?: Date | null }) {
  const cur = await currentInvitation();
  if (!cur) redirect('/not-found');
  const { inv } = cur;
  const data = { status, completedAt: new Date(), ...extra };
  if (inv.assessment) {
    if (inv.assessment.status === 'completed') redirect('/done');
    await prisma.assessment.update({ where: { id: inv.assessment.id }, data });
  } else {
    const q = await resolveForm(inv.member);
    if (!q) redirect('/goodbye?reason=no_form');
    await prisma.assessment.create({ data: { invitationId: inv.id, questionnaireId: q.id, questionnaireVersion: q.version, ...data } });
  }
  await setDisposition(inv.id, status, extra.outcomeReason ?? undefined);
  const { ip, userAgent } = await clientInfo();
  await audit(status, inv.id, { ip, userAgent, detail: { reason: extra.outcomeReason ?? null } });
  await endSession();
}

export async function decline(form: FormData) {
  const r = String(form.get('reason') ?? '');
  await setOutcome('declined', { outcomeReason: REASONS.includes(r) ? r : null });
  redirect('/goodbye?reason=declined');
}

export async function reportComplete() {
  await setOutcome('reported_complete', { recheckAt: new Date(Date.now() + RECHECK_DAYS * 86400_000) });
  redirect('/goodbye?reason=reported');
}
