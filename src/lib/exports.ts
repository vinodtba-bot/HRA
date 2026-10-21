import { prisma } from './db';
import { log } from './log';
import { missingRequired, type Answers } from './questionnaire';
import { loadForm } from './forms';
import { firstOutreachDeadlineDays, businessDaysBetween } from './schedule';
import { timezoneFor } from './outreach';
import { writeExport } from './storage';

// Nightly CSV files for the plan: the MVP stand-in for the HRA file out and the work queues.
// These contain PHI. In AWS they go to the encrypted data bucket (DATA_BUCKET); locally to ./exports.

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const toCsv = (rows: Record<string, unknown>[], header?: string[]) => {
  const cols = header ?? (rows[0] ? Object.keys(rows[0]) : []);
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n';
};

const iso = (d: Date | null | undefined) => (d ? d.toISOString() : '');

/** Marks stalled in-progress assessments as partial once they pass the state's follow-up window. */
export async function markPartials(now = new Date()) {
  const open = await prisma.assessment.findMany({
    where: { status: 'in_progress' },
    include: { answers: true, invitation: { include: { member: true } } },
  });
  let n = 0;
  for (const a of open) {
    const policy = await prisma.statePolicy.findUnique({ where: { state: a.invitation.member.state } });
    const days = policy?.partialFollowupDays ?? 14;
    if (a.startedAt.getTime() + days * 86400_000 > now.getTime()) continue;
    const form = await loadForm(a);
    const answers: Answers = Object.fromEntries(a.answers.map(x => [x.linkId, x.value]));
    const missing = missingRequired(form.items, answers);
    if (!missing.length) continue; // finished but never reached /done; the member's next visit completes it
    await prisma.assessment.update({ where: { id: a.id }, data: { status: 'partial', missingRequired: missing } });
    n++;
  }
  return n;
}

export type ExportKind = 'completed' | 'partial_followup' | 'referrals' | 'bad_numbers' | 'reported_complete' | 'declined' | 'sla_overdue' | 'callbacks';

export async function buildExport(kind: ExportKind, now = new Date()): Promise<string> {
  switch (kind) {
    case 'completed': {
      const rows = await prisma.assessment.findMany({
        where: { status: 'completed' },
        include: { answers: true, carePlan: true, invitation: { include: { member: true } } },
        orderBy: { completedAt: 'asc' },
      });
      return toCsv(rows.map(a => ({
        plan_member_id: a.invitation.member.planMemberId,
        state: a.invitation.member.state,
        line_of_business: a.invitation.member.lineOfBusiness,
        form_id: a.questionnaireId,
        form_version: a.questionnaireVersion,
        completion_method: a.completionMethod,
        started_at: iso(a.startedAt),
        completed_at: iso(a.completedAt),
        answers: Object.fromEntries(a.answers.map(x => [x.linkId, x.value])),
        care_plan: (a.carePlan?.items as { rule: string }[] | undefined)?.map(i => i.rule).join(';') ?? '',
      })), ['plan_member_id', 'state', 'line_of_business', 'form_id', 'form_version', 'completion_method', 'started_at', 'completed_at', 'answers', 'care_plan']);
    }
    case 'partial_followup': {
      const rows = await prisma.assessment.findMany({
        where: { status: 'partial' },
        include: { referrals: true, answers: true, invitation: { include: { member: true } } },
      });
      // Highest need first: any referral, then risk tier, then fewest missing answers.
      const flagged = (a: (typeof rows)[number]) => {
        const v = Object.fromEntries(a.answers.map(x => [x.linkId, x.value]));
        return a.referrals.length > 0 || v.fell === true || ['often', 'sometimes'].includes(String(v.food_worry)) || v.housing_unstable === true;
      };
      rows.sort((a, b) => Number(flagged(b)) - Number(flagged(a)) || b.invitation.member.riskTier - a.invitation.member.riskTier || a.missingRequired.length - b.missingRequired.length);
      return toCsv(rows.map(a => ({
        plan_member_id: a.invitation.member.planMemberId,
        risk_tier: a.invitation.member.riskTier,
        flagged: flagged(a),
        form_id: a.questionnaireId,
        missing_required: a.missingRequired.join(';'),
        last_activity_at: iso(a.lastActivityAt),
      })), ['plan_member_id', 'risk_tier', 'flagged', 'form_id', 'missing_required', 'last_activity_at']);
    }
    case 'referrals': {
      const rows = await prisma.referral.findMany({
        include: { assessment: { include: { invitation: { include: { member: true } } } } },
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      });
      return toCsv(rows.map(r => ({
        program: r.program, priority: r.priority, reason: r.reason,
        plan_member_id: r.assessment.invitation.member.planMemberId,
        created_at: iso(r.createdAt), sent_at: iso(r.sentAt),
      })), ['program', 'priority', 'reason', 'plan_member_id', 'created_at', 'sent_at']);
    }
    case 'bad_numbers': {
      const rows = await prisma.member.findMany({ where: { badNumberAt: { not: null } } });
      return toCsv(rows.map(m => ({ plan_member_id: m.planMemberId, phone_e164: m.phoneE164, bad_number_at: iso(m.badNumberAt) })),
        ['plan_member_id', 'phone_e164', 'bad_number_at']);
    }
    case 'reported_complete': {
      const rows = await prisma.assessment.findMany({
        where: { status: 'reported_complete', recheckAt: { lte: now } },
        include: { invitation: { include: { member: true } } },
      });
      return toCsv(rows.map(a => ({ plan_member_id: a.invitation.member.planMemberId, reported_at: iso(a.completedAt), recheck_at: iso(a.recheckAt) })),
        ['plan_member_id', 'reported_at', 'recheck_at']);
    }
    case 'declined': {
      const rows = await prisma.assessment.findMany({ where: { status: 'declined' }, include: { invitation: { include: { member: true } } } });
      return toCsv(rows.map(a => ({ plan_member_id: a.invitation.member.planMemberId, declined_at: iso(a.completedAt), reason: a.outcomeReason })),
        ['plan_member_id', 'declined_at', 'reason']);
    }
    case 'callbacks': {
      const rows = await prisma.auditEvent.findMany({
        where: { event: 'callback_requested' }, include: { invitation: { include: { member: true } } }, orderBy: { at: 'asc' },
      });
      return toCsv(rows.map(e => ({
        plan_member_id: e.invitation?.member.planMemberId, topic: (e.detail as { topic?: string } | null)?.topic, requested_at: iso(e.at),
      })), ['plan_member_id', 'topic', 'requested_at']);
    }
    case 'sla_overdue':
      return toCsv(await slaOverdue(now), ['plan_member_id', 'risk_tier', 'imported_at', 'deadline_business_days']);
  }
}

/** Members still not texted after their risk tier's first-outreach deadline. */
export async function slaOverdue(now = new Date()) {
  const invs = await prisma.invitation.findMany({
    where: { messages: { none: { sentAt: { not: null } } }, member: { optedOutAt: null, badNumberAt: null } },
    include: { member: true },
  });
  const out: { plan_member_id: string; risk_tier: number; imported_at: string; deadline_business_days: number }[] = [];
  for (const i of invs) {
    const tz = await timezoneFor(i.member.state);
    const days = firstOutreachDeadlineDays(i.member.riskTier);
    if (businessDaysBetween(i.createdAt, now, tz) > days)
      out.push({ plan_member_id: i.member.planMemberId, risk_tier: i.member.riskTier, imported_at: iso(i.createdAt), deadline_business_days: days });
  }
  return out;
}

export const NIGHTLY_EXPORTS: ExportKind[] = ['completed', 'partial_followup', 'referrals', 'callbacks', 'bad_numbers', 'reported_complete', 'declined', 'sla_overdue'];

export async function runNightly(now = new Date(), dir?: string) {
  const partials = await markPartials(now);
  const day = now.toISOString().slice(0, 10);
  const files: string[] = [];
  for (const k of NIGHTLY_EXPORTS) files.push(await writeExport(day, `${k}.csv`, await buildExport(k, now), dir));
  await prisma.referral.updateMany({ where: { sentAt: null }, data: { sentAt: now } });
  log.info({ partials, files: files.length, to: files[0]?.replace(/[^/]+$/, '') }, 'nightly exports written');
  return { partials, files };
}
