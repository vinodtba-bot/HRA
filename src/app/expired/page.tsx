import { notFound } from 'next/navigation';
import { invitationFromLinkCookie } from '@/lib/invitation';
import { relink } from './actions';
import { t } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function ExpiredPage({ searchParams }: { searchParams: Promise<{ sent?: string; limit?: string }> }) {
  const sp = await searchParams;
  const { s } = await t();
  if (sp.sent) {
    return (
      <main>
        <h1>{s.expired.sentH1}</h1>
        <p>{s.expired.sentBody}</p>
      </main>
    );
  }
  const inv = await invitationFromLinkCookie();
  if (!inv) notFound();
  return (
    <main>
      <h1>{s.expired.h1}</h1>
      <p>{s.expired.body}</p>
      {sp.limit && <p className="error" role="alert">{s.expired.limit}</p>}
      <form action={relink}>
        <button type="submit">{s.expired.button}</button>
      </form>
    </main>
  );
}
