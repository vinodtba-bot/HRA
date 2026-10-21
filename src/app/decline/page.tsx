import { notFound } from 'next/navigation';
import { currentInvitation } from '@/lib/invitation';
import { decline } from '../outcomes';
import { t } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function DeclinePage() {
  if (!(await currentInvitation())) notFound();
  const { s } = await t();
  return (
    <main>
      <h1>{s.decline.h1}</h1>
      <p>{s.decline.body}</p>
      <form action={decline} className="card">
        <label htmlFor="reason">{s.decline.reasonLabel}</label>
        <select id="reason" name="reason" defaultValue="">
          {Object.entries(s.decline.reasons).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <button type="submit">{s.decline.button}</button>
      </form>
      <div className="links"><a href="/start">{s.decline.back}</a></div>
    </main>
  );
}
