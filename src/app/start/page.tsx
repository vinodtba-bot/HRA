import { redirect, notFound } from 'next/navigation';
import { invitationFromLinkCookie, isExpired } from '@/lib/invitation';
import { verifyFieldsFor, FIELD_LABELS } from '@/lib/identity';
import { t } from '@/lib/lang';
import VerifyForm from './VerifyForm';

export const dynamic = 'force-dynamic';

// No name or health content appears before verification: only the plan, a purpose line and the identity form.
export default async function StartPage() {
  const inv = await invitationFromLinkCookie();
  if (!inv) notFound();
  if (isExpired(inv)) redirect('/expired');
  const fields = await verifyFieldsFor(inv.member.state);
  const { s } = await t();
  return (
    <main>
      <h1>{s.start.h1}</h1>
      <p>{s.start.intro}</p>
      <div className="card">
        <p className="muted">{s.start.confirm}</p>
        <VerifyForm fields={fields.map(f => ({ name: f, ...FIELD_LABELS[f], ...s.fields[f] }))} submit={s.start.submit} checking={s.start.checking} />
      </div>
      <div className="links">
        <a href="/already-done">{s.start.alreadyDone}</a>
        <a href="/decline">{s.start.noThanks}</a>
      </div>
    </main>
  );
}
