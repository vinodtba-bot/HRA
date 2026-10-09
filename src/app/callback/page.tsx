import { requireSession } from '@/lib/session';
import { requestCallback } from './actions';

export const dynamic = 'force-dynamic';

const TOPICS: Record<string, string> = {
  falls: 'fall prevention', food: 'help with food', housing: 'help with housing', rides: 'rides to appointments',
  mood: 'talking with a care manager', pcp: 'choosing a doctor', tobacco: 'quitting tobacco', daily_help: 'help at home',
};

export default async function CallbackPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  await requireSession();
  const { topic = '' } = await searchParams;
  const label = TOPICS[topic] ?? 'your care plan';
  return (
    <main>
      <h1>Get a call about {label}</h1>
      <p>Someone from your plan will call the phone number we have on file, usually within 2 business days.</p>
      <form action={requestCallback}>
        <input type="hidden" name="topic" value={TOPICS[topic] ? topic : 'other'} />
        <button type="submit">Yes, please call me</button>
      </form>
      <div className="links"><a href="/done">Back to my plan</a></div>
    </main>
  );
}
