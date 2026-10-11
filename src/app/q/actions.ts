'use server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession, touchSession } from '@/lib/session';
import { loadForm } from '@/lib/forms';
import { crisisTriggered, parseValue, type Answers } from '@/lib/questionnaire';
import { audit } from '@/lib/audit';
import { boss, Q } from '@/lib/jobs';
import { Prisma } from '@prisma/client';

/** Auto-save: every tap upserts one answer, then the page asks the engine for the next question. */
export async function answer(form: FormData) {
  const { session, assessment } = await requireSession();
  if (assessment.status !== 'in_progress') redirect('/done');
  const def = await loadForm(assessment);
  const linkId = String(form.get('linkId') ?? '');
  const item = def.items.find(i => i.linkId === linkId);
  if (!item) throw new Error('unknown question');

  let value: unknown;
  try {
    value = parseValue(item, form.has('value') ? String(form.get('value')) : null);
  } catch {
    redirect(`/q?edit=${linkId}&error=1`);
  }

  // A skip is stored as JSON null so the flow moves on; scoring ignores it.
  const json = value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
  await prisma.answer.upsert({
    where: { assessmentId_linkId: { assessmentId: assessment.id, linkId } },
    create: { assessmentId: assessment.id, linkId, value: json },
    update: { value: json, answeredAt: new Date() },
  });
  await prisma.assessment.update({ where: { id: assessment.id }, data: { currentLinkId: linkId, lastActivityAt: new Date() } });
  await touchSession(session.id);
  await audit('answered', assessment.invitationId, { detail: { linkId } }); // never the value

  // Crisis protocol: a positive answer to a self-harm item shows 988 at once and alerts a care manager.
  if (item.crisis && !assessment.crisisFlaggedAt) {
    const rows = await prisma.answer.findMany({ where: { assessmentId: assessment.id } });
    const answers: Answers = Object.fromEntries(rows.map(r => [r.linkId, r.value]));
    if (crisisTriggered(def.items, answers)) {
      await prisma.assessment.update({ where: { id: assessment.id }, data: { crisisFlaggedAt: new Date() } });
      await prisma.referral.upsert({
        where: { assessmentId_program: { assessmentId: assessment.id, program: 'crisis' } },
        create: { assessmentId: assessment.id, program: 'crisis', priority: 0, reason: 'Positive answer on self-harm question' },
        update: {},
      });
      await (await boss()).send(Q.crisisAlert, { assessmentId: assessment.id }, { priority: 10 });
      await audit('crisis_flagged', assessment.invitationId, { actor: 'system' });
      redirect('/crisis');
    }
  }
  redirect('/q');
}
