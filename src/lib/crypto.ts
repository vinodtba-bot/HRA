import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const need = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
};

/** 16 random bytes = 128 bits, 22 base64url characters. Only ever lives in memory and in the SMS. */
export const newCode = () => randomBytes(16).toString('base64url');
export const CODE_RE = /^[A-Za-z0-9_-]{22}$/;

/** What the database stores instead of the code, so a database leak does not leak working links. */
export const hashCode = (code: string) =>
  createHash('sha256').update(code + need('TOKEN_PEPPER')).digest();

export type IdentityField = 'dob' | 'zip' | 'medicaid_id';

/** Normalizes an identity value so "12345 " and "12345" or "a1" and "A1" compare equal. */
export function normalizeField(field: IdentityField, value: string): string {
  const v = value.trim().toUpperCase();
  if (field === 'zip') return v.slice(0, 5);
  if (field === 'medicaid_id') return v.replace(/[\s-]/g, '');
  return v; // dob is already ISO yyyy-mm-dd
}

/** Identity values are stored as HMACs: checkable, never readable. */
export const hmacField = (field: IdentityField, value: string) =>
  createHmac('sha256', need('DOB_PEPPER')).update(`${field}:${normalizeField(field, value)}`).digest();

export const sameBytes = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** Session ids: random in the cookie, hashed in the table. */
export const newSessionId = () => randomBytes(32).toString('base64url');
export const hashSessionId = (sid: string) =>
  createHash('sha256').update(sid + need('SESSION_SECRET')).digest('hex');
