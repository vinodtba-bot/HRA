import { prisma } from './db';
import type { Prisma } from '@prisma/client';

export type AuditEventName =
  | 'issued' | 'sent' | 'opened' | 'verify_ok' | 'verify_fail' | 'locked' | 'answered'
  | 'completed' | 'declined' | 'reported_complete' | 'relinked' | 'expired_view'
  | 'crisis_flagged' | 'callback_requested' | 'opted_out' | 'bad_number' | 'admin_view' | 'admin_export';

/** Append-only. Nothing updates or deletes audit_event rows. */
export async function audit(
  event: AuditEventName,
  invitationId: string | null,
  opts: { actor?: string; ip?: string | null; userAgent?: string | null; detail?: Prisma.InputJsonValue } = {},
) {
  await prisma.auditEvent.create({
    data: { event, invitationId, actor: opts.actor ?? 'member', ip: opts.ip ?? null, userAgent: opts.userAgent ?? null, detail: opts.detail },
  });
}
