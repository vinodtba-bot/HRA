import { prisma } from './db';
import { hashCode, newCode } from './crypto';
import { audit } from './audit';
import { sendSms } from './sms';
import { sms } from './messages';
import { linkBase, MAX_OUTREACH_ATTEMPTS, OUTREACH_PAUSE_DAYS, RESUME_NUDGE_DAYS } from './config';
import { addBusinessDays, ATTEMPT_HOURS, atLocalHour, businessDaysBetween, nextAllowedSendTime } from './schedule';
import { enqueueSend, type SendLinkJob } from './jobs';
import { log } from './log';

export const OUTREACH_KINDS = ['invite', 'reminder', 'resume'] as const;
const TERMINAL = ['completed', 'declined', 'reported_complete'];

export async function timezoneFor(state: string) {
  return (await prisma.statePolicy.findUnique({ where: { state } }))?.timezone ?? 'America/New_York';
}

/**
 * Issues a fresh code for the invitation and texts it. The code exists only in memory and in the SMS.
 * The previous code stays valid (as prev_token_hash) so the member's last text still works, except
 * on relink, which revokes every earlier code.
 */
export async function sendLink({ invitationId, kind }: SendLinkJob): Promise<'sent' | 'skipped'> {
  const inv = await prisma.invitation.findUniqueOrThrow({
    where: { id: invitationId },
    include: { member: true, campaign: true, assessment: true },
  });
  const m = inv.member;
  const outreach = (OUTREACH_KINDS as readonly string[]).includes(kind);
  const now = new Date();

  if (m.optedOutAt || m.badNumberAt) return 'skipped';
  if (outreach && m.outreachPausedUntil && m.outreachPausedUntil > now) return 'skipped';
  if (outreach && inv.assessment && TERMINAL.includes(inv.assessment.status)) return 'skipped';
  if (outreach && inv.campaign.status !== 'active') return 'skipped';

  const code = newCode();
  const attemptNumber = outreach
    ? (await prisma.message.count({ where: { invitationId, kind: { in: [...OUTREACH_KINDS] } } })) + 1
    : 1;

  await prisma.invitation.update({
    where: { id: inv.id },
    data: {
      tokenHash: hashCode(code),
      prevTokenHash: kind === 'relink' ? null : inv.tokenHash,
      expiresAt: new Date(now.getTime() + inv.campaign.linkTtlDays * 86400_000),
      revokedAt: null,
    },
  });
  const msg = await prisma.message.create({ data: { invitationId, kind, attemptNumber } });

  const link = `${linkBase()}/r/${code}`;
  const formName = inv.assessment
    ? (await prisma.questionnaire.findUnique({
        where: { id_version: { id: inv.assessment.questionnaireId, version: inv.assessment.questionnaireVersion } },
      }))?.displayName ?? 'check-in'
    : 'check-in';
  const body =
    kind === 'invite' ? sms.invite(link)
    : kind === 'reminder' ? sms.reminder(link)
    : kind === 'resume' ? sms.resume(link)
    : kind === 'relink' ? sms.relink(link)
    : sms.confirm(formName, link);

  try {
    const r = await sendSms(inv.phoneE164, body);
    await prisma.message.update({ where: { id: msg.id }, data: { twilioSid: r.sid, status: r.status, sentAt: new Date() } });
  } catch (err) {
    await prisma.message.update({ where: { id: msg.id }, data: { status: 'failed' } });
    throw err; // pg-boss retries; the retry issues a fresh code, which is fine
  }
  await audit('sent', inv.id, { actor: 'system', detail: { kind, attemptNumber } });
  return 'sent';
}

/** Sets the standard disposition on the invitation's latest outreach message. */
export async function setDisposition(invitationId: string, disposition: string, reason?: string) {
  const last = await prisma.message.findFirst({
    where: { invitationId, kind: { in: [...OUTREACH_KINDS] } },
    orderBy: { createdAt: 'desc' },
  });
  if (last) await prisma.message.update({ where: { id: last.id }, data: { disposition, dispositionReason: reason ?? null } });
}

/**
 * Daily outreach pass (business days). For members who have not engaged: the next attempt goes out
 * 1 business day after the last one, at a different time of day; after 3 unanswered attempts outreach
 * pauses for 90 days. Members who started but stalled for 2 days get one resume text.
 */
export async function runDailyOutreach(now = new Date()) {
  const stats = { reminders: 0, paused: 0, resumes: 0 };
  const candidates = await prisma.invitation.findMany({
    where: {
      verifiedAt: null,
      revokedAt: null,
      campaign: { status: 'active' },
      member: { optedOutAt: null, badNumberAt: null, OR: [{ outreachPausedUntil: null }, { outreachPausedUntil: { lt: now } }] },
      OR: [{ assessment: null }, { assessment: { status: 'in_progress' } }],
    },
    include: {
      member: true,
      messages: { where: { kind: { in: [...OUTREACH_KINDS] } }, orderBy: { createdAt: 'desc' } },
    },
  });

  for (const inv of candidates) {
    const last = inv.messages[0];
    if (!last?.sentAt) continue; // initial send not done yet, or in flight
    const tz = await timezoneFor(inv.member.state);
    if (businessDaysBetween(last.sentAt, now, tz) < 1) continue;

    if (!last.disposition) await prisma.message.update({ where: { id: last.id }, data: { disposition: 'delivered_no_response' } });

    const attempts = inv.messages.length;
    if (attempts >= MAX_OUTREACH_ATTEMPTS) {
      if (!inv.member.outreachPausedUntil || inv.member.outreachPausedUntil < last.sentAt) {
        await prisma.member.update({
          where: { id: inv.memberId },
          data: { outreachPausedUntil: new Date(now.getTime() + OUTREACH_PAUSE_DAYS * 86400_000) },
        });
        stats.paused++;
      }
      continue;
    }
    // Today's slot for this attempt, or the next business day's if that hour has passed.
    const hour = ATTEMPT_HOURS[attempts % ATTEMPT_HOURS.length];
    let at = atLocalHour(now, tz, hour);
    if (at < now) at = atLocalHour(addBusinessDays(now, 1, tz), tz, hour);
    await enqueueSend(
      { invitationId: inv.id, kind: 'reminder' },
      { startAfter: nextAllowedSendTime(at, tz), singletonKey: `reminder:${inv.id}:${attempts + 1}` },
    );
    stats.reminders++;
  }

  const stalled = await prisma.assessment.findMany({
    where: {
      status: 'in_progress',
      resumeNudgedAt: null,
      lastActivityAt: { lt: new Date(now.getTime() - RESUME_NUDGE_DAYS * 86400_000) },
      invitation: { member: { optedOutAt: null, badNumberAt: null } },
    },
    include: { invitation: { include: { member: true } } },
  });
  for (const a of stalled) {
    const tz = await timezoneFor(a.invitation.member.state);
    await prisma.assessment.update({ where: { id: a.id }, data: { resumeNudgedAt: now } });
    await enqueueSend({ invitationId: a.invitationId, kind: 'resume' }, { startAfter: nextAllowedSendTime(now, tz) });
    stats.resumes++;
  }
  log.info(stats, 'daily outreach pass');
  return stats;
}
