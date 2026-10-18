import { redirect, notFound } from 'next/navigation';
import { invitationFromLinkCookie, isExpired } from '@/lib/invitation';
import { verifyFieldsFor, FIELD_LABELS } from '@/lib/identity';
import VerifyForm from './VerifyForm';

export const dynamic = 'force-dynamic';

// No name or health content appears before verification: only the plan, a purpose line and the identity form.
export default async function StartPage() {
  const inv = await invitationFromLinkCookie();
  if (!inv) notFound();
  if (isExpired(inv)) redirect('/expired');
  const fields = await verifyFieldsFor(inv.member.state);
  return (
    <main>
      <h1>Your health check-in</h1>
      <p>A few questions about your health and daily life, so your plan can offer the right help. It takes about 10 minutes and saves as you go.</p>
      <div className="card">
        <p className="muted">First, please confirm it is you.</p>
        <VerifyForm fields={fields.map(f => ({ name: f, ...FIELD_LABELS[f] }))} />
      </div>
      <div className="links">
        <a href="/already-done">I already did this check-in</a>
        <a href="/decline">No thanks, I don&apos;t want to do this</a>
      </div>
    </main>
  );
}
