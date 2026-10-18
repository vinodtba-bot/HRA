import { NextRequest, NextResponse } from 'next/server';
import { CODE_RE } from '@/lib/crypto';
import { findInvitationByCode } from '@/lib/invitation';
import { allow } from '@/lib/ratelimit';

// GET never changes state, so link-preview bots cannot use the link up. The code moves into a short-lived
// HttpOnly cookie and the browser is redirected, so the code leaves the address bar and referrer headers.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (!allow(`r:${ip}`, 20)) return new NextResponse('Too many requests', { status: 429 });

  const inv = CODE_RE.test(code) ? await findInvitationByCode(code) : null;
  const res = NextResponse.redirect(new URL(inv ? '/start' : '/not-found', req.url), 303);
  if (inv) res.cookies.set('inv', code, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 3600 });
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
