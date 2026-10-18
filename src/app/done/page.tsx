import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { loadForm } from '@/lib/forms';
import { effectiveAnswers, missingRequired, nextItem, type Answers } from '@/lib/questionnaire';
import { buildCarePlan, buildReferrals, type CarePlanItem } from '@/lib/careplan';
import { enqueueSend } from '@/lib/jobs';
import { audit } from '@/lib/audit';
import { setDisposition } from '@/lib/outreach';
import { PLAN_NURSE_LINE } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function DonePage() {
  const { assessment, invitation } = await requireSession();
  const form = await loadForm(assessment);

  if (assessment.status === 'in_progress') {
    const rows = await prisma.answer.findMany({ where: { assessmentId: assessment.id } });
    const answers: Answers = Object.fromEntries(rows.map(r => [r.linkId, r.value]));
    if (nextItem(form.items, answers) || missingRequired(form.items, answers).length) redirect('/q');
    await complete(assessment.id, invitation.id, effectiveAnswers(form.items, answers));
  } else if (assessment.status !== 'completed') {
    redirect('/goodbye');
  }

  const plan = await prisma.carePlan.findUnique({ where: { assessmentId: assessment.id } });
  const items = (plan?.items ?? []) as unknown as CarePlanItem[];
  return (
    <main>
      <h1>Thank you. Your {form.displayName} is complete.</h1>
      <p>Here is what your plan can help with, based on your answers. We also texted you a link to this page.</p>
      {items.length === 0 && (
        <div className="card"><p>Your answers did not show any needs right now. Keep up your regular checkups.</p></div>
      )}
      {items.map(i => (
        <div className="card plan-item" key={i.rule}>
          <h3>{i.title}</h3>
          <p>{i.detail}</p>
          {i.action && <a className="btn" href={i.action.href}>{i.action.label}</a>}
        </div>
      ))}
      {PLAN_NURSE_LINE && <p className="muted">Questions? Call our 24/7 nurse line at {PLAN_NURSE_LINE}.</p>}
    </main>
  );
}

/** Marks the assessment complete exactly once, saves the care plan and referrals, and queues the confirmation text. */
async function complete(assessmentId: string, invitationId: string, answers: Answers) {
  const done = await prisma.$transaction(async tx => {
    const r = await tx.assessment.updateMany({
      where: { id: assessmentId, status: 'in_progress' },
      data: { status: 'completed', completedAt: new Date(), missingRequired: [], completionMethod: 'self_web' },
    });
    if (r.count === 0) return false; // a second tab got here first
    await tx.carePlan.create({ data: { assessmentId, items: buildCarePlan(answers) } });
    for (const ref of buildReferrals(answers)) {
      await tx.referral.upsert({
        where: { assessmentId_program: { assessmentId, program: ref.program } },
        create: { assessmentId, ...ref },
        update: {},
      });
    }
    return true;
  });
  if (!done) return;
  await setDisposition(invitationId, 'completed');
  await audit('completed', invitationId);
  await enqueueSend({ invitationId, kind: 'confirm' }, { singletonKey: `confirm:${invitationId}` });
}
