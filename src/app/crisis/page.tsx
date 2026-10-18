import { PLAN_NURSE_LINE } from '@/lib/config';
import { requireSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function CrisisPage() {
  await requireSession();
  return (
    <main>
      <div className="card crisis" role="alert">
        <h1>You don&apos;t have to go through this alone</h1>
        <p>If you are thinking about hurting yourself, please reach out now. Help is free and available 24 hours a day.</p>
        <a className="btn" href="tel:988">Call or text 988</a>
        <p className="muted" style={{ marginTop: 10 }}>988 Suicide &amp; Crisis Lifeline</p>
        {PLAN_NURSE_LINE && <a className="btn secondary" href={`tel:${PLAN_NURSE_LINE.replace(/[^\d+]/g, '')}`}>Call our nurse line: {PLAN_NURSE_LINE}</a>}
        <p className="muted" style={{ marginTop: 14 }}>If you are in danger right now, call 911. A care manager from your plan will also reach out to you.</p>
      </div>
      <div className="links"><a href="/q">Continue my check-in</a></div>
    </main>
  );
}
