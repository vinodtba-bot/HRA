import { NextRequest, NextResponse } from 'next/server';
import { buildExport, NIGHTLY_EXPORTS, type ExportKind } from '@/lib/exports';
import { audit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!NIGHTLY_EXPORTS.includes(kind as ExportKind)) return new NextResponse('not found', { status: 404 });
  await audit('admin_export', null, { actor: 'admin', detail: { kind } });
  return new NextResponse(await buildExport(kind as ExportKind), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
