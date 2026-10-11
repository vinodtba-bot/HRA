import { PLAN_NURSE_LINE } from '@/lib/config';

export default async function Goodbye({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const text =
    reason === 'declined' ? "You're all set. We won't text you about this check-in again."
    : reason === 'reported' ? "Thanks. We'll check our records. You don't need to do anything else."
    : reason === 'no_form' ? "This check-in can't be completed online yet. A member of our team will reach out."
    : reason === 'callback' ? 'Thanks. Someone from your plan will call you soon.'
    : 'Thank you.';
  return (
    <main>
      <h1>{text}</h1>
      {PLAN_NURSE_LINE && <p className="muted">Questions? Call member services at {PLAN_NURSE_LINE}.</p>}
      <p className="muted">You can close this page.</p>
    </main>
  );
}
