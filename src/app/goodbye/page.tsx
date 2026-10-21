import { PLAN_NURSE_LINE } from '@/lib/config';
import { t } from '@/lib/lang';

export default async function Goodbye({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const { s } = await t();
  const text = (reason && reason !== 'close' && s.goodbye[reason]) || s.goodbye.default;
  return (
    <main>
      <h1>{text}</h1>
      {PLAN_NURSE_LINE && <p className="muted">{s.questionsMemberServices(PLAN_NURSE_LINE)}</p>}
      <p className="muted">{s.goodbye.close}</p>
    </main>
  );
}
