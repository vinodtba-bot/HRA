import { NextRequest, NextResponse } from 'next/server';

// Stand-in for the plan's SSO: HTTP basic auth on /admin. Replace with SSO + MFA before real member data.
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  const auth = req.headers.get('authorization') ?? '';
  const [scheme, encoded] = auth.split(' ');
  if (user && pass && scheme === 'Basic' && encoded) {
    const [u, ...rest] = atob(encoded).split(':');
    if (u === user && rest.join(':') === pass) return NextResponse.next();
  }
  return new NextResponse('Authentication required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="HRA admin"' } });
}

export const config = { matcher: ['/admin/:path*'] };
