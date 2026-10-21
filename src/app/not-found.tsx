import { PLAN_NURSE_LINE } from '@/lib/config';
import { t } from '@/lib/lang';

export default async function NotFound() {
  const { s } = await t();
  return (
    <main>
      <h1>{s.notFound.h1}</h1>
      <p>{s.notFound.body}</p>
      {PLAN_NURSE_LINE && <p className="muted">{s.memberServices(PLAN_NURSE_LINE)}</p>}
    </main>
  );
}
