import { requireSession } from '@/lib/session';
import { requestCallback } from './actions';
import { t } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function CallbackPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  await requireSession();
  const { topic = '' } = await searchParams;
  const { s } = await t();
  const TOPICS = s.callback.topics;
  const label = TOPICS[topic] ?? s.callback.fallback;
  return (
    <main>
      <h1>{s.callback.h1(label)}</h1>
      <p>{s.callback.body}</p>
      <form action={requestCallback}>
        <input type="hidden" name="topic" value={TOPICS[topic] ? topic : 'other'} />
        <button type="submit">{s.callback.button}</button>
      </form>
      <div className="links"><a href="/done">{s.callback.back}</a></div>
    </main>
  );
}
