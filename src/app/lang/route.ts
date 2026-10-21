import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { linkBase } from '@/lib/config';
import { getSession } from '@/lib/session';
import { LANGS, type Lang } from '@/lib/i18n';
import { LANG_COOKIE } from '@/lib/lang';

// Language switch. Sets a preference cookie and, for a verified member, saves the choice so later texts use it.
export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to') as Lang;
  const back = req.nextUrl.searchParams.get('back') ?? '/';
  const path = /^\/(?!\/)[\w\-/?=&%.]*$/.test(back) ? back : '/'; // own pages only
  const res = NextResponse.redirect(`${linkBase()}${path}`, 303);
  if (!LANGS.includes(to)) return res;
  res.cookies.set(LANG_COOKIE, to, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 365 * 86400 });
  const s = await getSession();
  if (s) await prisma.member.update({ where: { id: s.invitation.memberId }, data: { language: to } });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
