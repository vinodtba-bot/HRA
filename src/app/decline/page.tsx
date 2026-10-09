import { notFound } from 'next/navigation';
import { currentInvitation } from '@/lib/invitation';
import { decline } from '../outcomes';

export const dynamic = 'force-dynamic';

export default async function DeclinePage() {
  if (!(await currentInvitation())) notFound();
  return (
    <main>
      <h1>No problem</h1>
      <p>We won&apos;t text you about this check-in again. If you like, tell us why. This is optional.</p>
      <form action={decline} className="card">
        <label htmlFor="reason">Reason (optional)</label>
        <select id="reason" name="reason" defaultValue="">
          <option value="">Prefer not to say</option>
          <option value="not_interested">Not interested</option>
          <option value="no_time">No time right now</option>
          <option value="privacy">Privacy concerns</option>
          <option value="prefer_phone">I&apos;d rather talk to someone</option>
          <option value="other">Something else</option>
        </select>
        <button type="submit">Stop my check-in</button>
      </form>
      <div className="links"><a href="/start">Go back</a></div>
    </main>
  );
}
