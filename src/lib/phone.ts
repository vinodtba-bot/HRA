import { parsePhoneNumberFromString } from 'libphonenumber-js';

/** Returns an E.164 US mobile-shaped number, or null if it cannot be one. */
export function toE164(raw: string): string | null {
  const p = parsePhoneNumberFromString(raw ?? '', 'US');
  if (!p || !p.isValid()) return null;
  return p.number;
}
