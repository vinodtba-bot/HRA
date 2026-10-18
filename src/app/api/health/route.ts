import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Load balancer health check: the app is up and can reach Postgres. Returns no data.
export async function GET() {
  try {
    await prisma.$queryRaw`select 1`;
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
