import { NextRequest, NextResponse } from 'next/server';
import { verifyAlbIdentity } from '@/lib/alb-auth';

// Admin access. In AWS the load balancer sends /admin through a Cognito login with MFA, and the app checks the
// load balancer's signed identity header (ADMIN_AUTH=alb). Elsewhere (your laptop): HTTP basic auth.
export async function middleware(req: NextRequest) {
  if (process.env.ADMIN_AUTH === 'alb') {
    const email = await verifyAlbIdentity(req.headers.get('x-amzn-oidc-data'), process.env.ADMIN_ALB_ARN ?? '');
    if (email) return NextResponse.next();
    return new NextResponse('Sign-in required', { status: 401 });
  }
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
