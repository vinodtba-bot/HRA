import { notFound } from 'next/navigation';
import { currentInvitation } from '@/lib/invitation';
import { reportComplete } from '../outcomes';

export const dynamic = 'force-dynamic';

export default async function AlreadyDonePage() {
  if (!(await currentInvitation())) notFound();
  return (
    <main>
      <h1>Already did your check-in?</h1>
      <p>Thanks for letting us know. We&apos;ll check our records and pause these texts while we do.</p>
      <form action={reportComplete}>
        <button type="submit">Yes, I already did it</button>
      </form>
      <div className="links"><a href="/start">Go back</a></div>
    </main>
  );
}
