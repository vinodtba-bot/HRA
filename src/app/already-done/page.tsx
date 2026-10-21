import { notFound } from 'next/navigation';
import { currentInvitation } from '@/lib/invitation';
import { reportComplete } from '../outcomes';
import { t } from '@/lib/lang';

export const dynamic = 'force-dynamic';

export default async function AlreadyDonePage() {
  if (!(await currentInvitation())) notFound();
  const { s } = await t();
  return (
    <main>
      <h1>{s.alreadyDone.h1}</h1>
      <p>{s.alreadyDone.body}</p>
      <form action={reportComplete}>
        <button type="submit">{s.alreadyDone.button}</button>
      </form>
      <div className="links"><a href="/start">{s.decline.back}</a></div>
    </main>
  );
}
