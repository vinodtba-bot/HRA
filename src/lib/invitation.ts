import { cookies } from 'next/headers';
import { prisma } from './db';
import { hashCode } from './crypto';
import { getSession } from './session';

/** Looks an invitation up by the code from the link: the current code or the one before it. */
export async function findInvitationByCode(code: string) {
  const h = hashCode(code);
  return prisma.invitation.findFirst({
    where: { OR: [{ tokenHash: h }, { prevTokenHash: h }] },
    include: { member: true, assessment: true },
  });
}

/** The invitation from the short-lived link cookie, or null. Holds no proof of identity. */
export async function invitationFromLinkCookie() {
  const code = (await cookies()).get('inv')?.value;
  return code ? findInvitationByCode(code) : null;
}

/** Verified session first, else the link cookie. Used by decline and "already did this", which need no PHI. */
export async function currentInvitation() {
  const s = await getSession();
  if (s) return { inv: s.invitation, verified: true as const };
  const inv = await invitationFromLinkCookie();
  return inv ? { inv, verified: false as const } : null;
}

export const isExpired = (inv: { expiresAt: Date; revokedAt: Date | null }) =>
  !!inv.revokedAt || inv.expiresAt.getTime() < Date.now();
