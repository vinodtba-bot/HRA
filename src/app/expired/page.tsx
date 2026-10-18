import { notFound } from 'next/navigation';
import { invitationFromLinkCookie } from '@/lib/invitation';
import { relink } from './actions';

export const dynamic = 'force-dynamic';

export default async function ExpiredPage({ searchParams }: { searchParams: Promise<{ sent?: string; limit?: string }> }) {
  const sp = await searchParams;
  if (sp.sent) {
    return (
      <main>
        <h1>New link sent</h1>
        <p>We texted a new link to the phone number we have on file. Please open it to continue.</p>
      </main>
    );
  }
  const inv = await invitationFromLinkCookie();
  if (!inv) notFound();
  return (
    <main>
      <h1>This link has expired</h1>
      <p>For your privacy, check-in links only work for a limited time. We can text a new one to the phone number we have on file.</p>
      {sp.limit && <p className="error" role="alert">We have already sent several new links today. Please try again tomorrow.</p>}
      <form action={relink}>
        <button type="submit">Text me a new link</button>
      </form>
    </main>
  );
}
