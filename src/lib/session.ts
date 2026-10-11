import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from './db';
import { hashSessionId, newSessionId } from './crypto';
import { SESSION_IDLE_MIN, SESSION_MAX_HOURS } from './config';

const SID = 'sid';
const secure = process.env.NODE_ENV === 'production';

export async function clientInfo() {
  const h = await headers();
  return { ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null, userAgent: h.get('user-agent') };
}

export async function startSession(invitationId: string) {
  const sid = newSessionId();
  const { ip, userAgent } = await clientInfo();
  await prisma.session.create({
    data: { id: hashSessionId(sid), invitationId, ip, userAgent, expiresAt: new Date(Date.now() + SESSION_MAX_HOURS * 3600_000) },
  });
  (await cookies()).set(SID, sid, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: SESSION_MAX_HOURS * 3600 });
}

/** The current verified session and its assessment, or null. Enforces 30 min idle and 4 h absolute limits. */
export async function getSession() {
  const sid = (await cookies()).get(SID)?.value;
  if (!sid) return null;
  const s = await prisma.session.findUnique({
    where: { id: hashSessionId(sid) },
    include: { invitation: { include: { assessment: true, member: true } } },
  });
  if (!s) return null;
  const now = Date.now();
  if (s.expiresAt.getTime() < now || s.lastSeenAt.getTime() + SESSION_IDLE_MIN * 60_000 < now) return null;
  if (s.invitation.revokedAt) return null;
  return s;
}

export async function requireSession() {
  const s = await getSession();
  if (!s || !s.invitation.assessment) redirect('/start');
  return { session: s, invitation: s.invitation, member: s.invitation.member, assessment: s.invitation.assessment! };
}

/** Slides the idle window. */
export async function touchSession(sessionId: string) {
  await prisma.session.update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } });
}

export async function endSession() {
  const c = await cookies();
  const sid = c.get(SID)?.value;
  if (sid) await prisma.session.deleteMany({ where: { id: hashSessionId(sid) } });
  c.delete(SID);
}
