import { prisma } from './db';
import { hmacField, sameBytes, type IdentityField } from './crypto';

export const DEFAULT_FIELDS: IdentityField[] = ['dob', 'zip'];

export const FIELD_LABELS: Record<IdentityField, { label: string; type: string; hint: string; autoComplete?: string; inputMode?: 'numeric' | 'text' }> = {
  dob: { label: 'Date of birth', type: 'date', hint: '', autoComplete: 'bday' },
  zip: { label: 'ZIP code', type: 'text', hint: '5 digits', autoComplete: 'postal-code', inputMode: 'numeric' },
  medicaid_id: { label: 'Medicaid ID', type: 'text', hint: 'On your member ID card', inputMode: 'text' },
};

export async function verifyFieldsFor(state: string): Promise<IdentityField[]> {
  const policy = await prisma.statePolicy.findUnique({ where: { state } });
  return (policy?.verifyFields as IdentityField[] | undefined)?.length ? (policy!.verifyFields as IdentityField[]) : DEFAULT_FIELDS;
}

type Stored = { dobHmac: Uint8Array; zipHmac: Uint8Array | null; medicaidIdHmac: Uint8Array | null };

/** Every configured field must be present and match its stored HMAC. Compared in constant time. */
export function checkIdentity(member: Stored, fields: IdentityField[], input: (f: IdentityField) => string): boolean {
  const stored: Record<IdentityField, Uint8Array | null> = {
    dob: member.dobHmac, zip: member.zipHmac, medicaid_id: member.medicaidIdHmac,
  };
  // Evaluate every field (no short-circuit) so timing does not reveal which one was wrong.
  const results = fields.map(f => {
    const raw = input(f);
    const s = stored[f];
    return raw !== '' && s != null && sameBytes(hmacField(f, raw), Buffer.from(s));
  });
  return results.every(Boolean);
}
