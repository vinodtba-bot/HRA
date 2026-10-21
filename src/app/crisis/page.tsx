import { PLAN_NURSE_LINE } from '@/lib/config';
import { requireSession } from '@/lib/session';
import { t } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function CrisisPage() {
  await requireSession();
  const { s } = await t();
  return (
    <main>
      <div className="card crisis" role="alert">
        <h1>{s.crisis.h1}</h1>
        <p>{s.crisis.body}</p>
        <a className="btn" href="tel:988">{s.crisis.call988}</a>
        <p className="muted" style={{ marginTop: 10 }}>{s.crisis.lifeline}</p>
        {PLAN_NURSE_LINE && <a className="btn secondary" href={`tel:${PLAN_NURSE_LINE.replace(/[^\d+]/g, '')}`}>{s.crisis.nurse(PLAN_NURSE_LINE)}</a>}
        <p className="muted" style={{ marginTop: 14 }}>{s.crisis.danger}</p>
      </div>
      <div className="links"><a href="/q">{s.crisis.continue}</a></div>
    </main>
  );
}
