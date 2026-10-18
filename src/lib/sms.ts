import fs from 'node:fs';
import path from 'node:path';
import twilio from 'twilio';
import { log } from './log';
import { linkBase } from './config';

// Channel adapter. Twilio when configured; otherwise a console stub that writes to .dev-outbox.log
// so the whole flow can be clicked through locally without a Twilio account.

export const twilioConfigured = () =>
  !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_API_KEY && process.env.TWILIO_API_SECRET && process.env.TWILIO_MESSAGING_SERVICE_SID);

let client: ReturnType<typeof twilio> | null = null;
const tw = () =>
  (client ??= twilio(process.env.TWILIO_API_KEY!, process.env.TWILIO_API_SECRET!, { accountSid: process.env.TWILIO_ACCOUNT_SID! }));

export type SendResult = { sid: string; status: string };

export async function sendSms(to: string, body: string): Promise<SendResult> {
  if (!twilioConfigured()) {
    if (process.env.NODE_ENV === 'production' && process.env.SMS_STUB !== '1') throw new Error('Twilio is not configured');
    const sid = `SMdev${Date.now()}${Math.floor(Math.random() * 1e6)}`;
    // Dev only: the outbox file holds the link so you can open it. Never enable this with real members.
    fs.appendFileSync(path.join(process.cwd(), '.dev-outbox.log'), `${new Date().toISOString()}\t${to}\t${body}\n`);
    log.info({ sid }, 'sms stub: written to .dev-outbox.log');
    return { sid, status: 'sent' };
  }
  const m = await tw().messages.create({
    to,
    body,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
    statusCallback: `${linkBase()}/api/twilio/status`,
  });
  return { sid: m.sid, status: m.status };
}

/** Twilio Lookup v2 line type. Returns 'unknown' when Twilio is not configured. */
export async function lookupLineType(e164: string): Promise<'mobile' | 'landline' | 'voip' | 'unknown'> {
  if (!twilioConfigured()) return 'unknown';
  try {
    const r = await tw().lookups.v2.phoneNumbers(e164).fetch({ fields: 'line_type_intelligence' });
    const t = (r.lineTypeIntelligence as { type?: string } | null)?.type;
    if (t === 'mobile' || t === 'landline') return t;
    if (t === 'nonFixedVoip' || t === 'fixedVoip') return 'voip';
    return 'unknown';
  } catch (err) {
    log.warn({ err: (err as Error).message }, 'lookup failed');
    return 'unknown';
  }
}

/** Validates X-Twilio-Signature. Uses the account auth token, which Twilio signs webhooks with. */
export function validTwilioSignature(signature: string | null, url: string, params: Record<string, string>): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) return process.env.NODE_ENV !== 'production'; // dev: allow local curl tests
  return !!signature && twilio.validateRequest(token, signature, url, params);
}
