import { PLAN_NURSE_LINE } from '@/lib/config';

export default function NotFound() {
  return (
    <main>
      <h1>We could not find that link</h1>
      <p>Please check that you opened the full link from your text message.</p>
      {PLAN_NURSE_LINE && <p className="muted">Need help? Call member services at {PLAN_NURSE_LINE}.</p>}
    </main>
  );
}
