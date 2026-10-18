'use server';
import { redirect } from 'next/navigation';
import { requireSession } from '@/lib/session';
import { audit } from '@/lib/audit';

// MVP stand-in for the interventions engine: the request lands in the audit log and the nightly referrals export.
export async function requestCallback(form: FormData) {
  const { invitation } = await requireSession();
  const topic = String(form.get('topic') ?? 'other').slice(0, 40);
  await audit('callback_requested', invitation.id, { detail: { topic } });
  redirect('/goodbye?reason=callback');
}
