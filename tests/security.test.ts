import { describe, expect, it } from 'vitest';
import { CODE_RE, hashCode, hmacField, newCode, sameBytes } from '@/lib/crypto';
import { checkIdentity } from '@/lib/identity';
import { pickAssignment } from '@/lib/forms';
import { addBusinessDays, businessDaysBetween, inQuietHours, nextAllowedSendTime } from '@/lib/schedule';

process.env.TOKEN_PEPPER = 'test-token-pepper';
process.env.DOB_PEPPER = 'test-dob-pepper';
process.env.IGNORE_QUIET_HOURS = '0';

describe('link codes', () => {
  it('are 22 base64url characters (128 bits)', () => {
    const c = newCode();
    expect(c).toMatch(CODE_RE);
    expect(Buffer.from(c, 'base64url')).toHaveLength(16);
  });
  it('are unique', () => expect(new Set(Array.from({ length: 1000 }, newCode)).size).toBe(1000));
  it('hash deterministically and depend on the pepper', () => {
    const c = newCode();
    expect(sameBytes(hashCode(c), hashCode(c))).toBe(true);
    const before = hashCode(c);
    process.env.TOKEN_PEPPER = 'other';
    expect(sameBytes(before, hashCode(c))).toBe(false);
    process.env.TOKEN_PEPPER = 'test-token-pepper';
  });
});

describe('identity check', () => {
  const member = {
    dobHmac: hmacField('dob', '1968-04-12'),
    zipHmac: hmacField('zip', '78701'),
    medicaidIdHmac: hmacField('medicaid_id', 'TX123456789'),
  };
  const input = (v: Record<string, string>) => (f: string) => v[f] ?? '';
  it('passes with Medicaid ID + DOB, normalizing case and spaces', () =>
    expect(checkIdentity(member, ['medicaid_id', 'dob'], input({ medicaid_id: ' tx 123456789', dob: '1968-04-12' }))).toBe(true));
  it('fails on a wrong DOB', () =>
    expect(checkIdentity(member, ['medicaid_id', 'dob'], input({ medicaid_id: 'TX123456789', dob: '1968-04-13' }))).toBe(false));
  it('fails when a required field is blank', () =>
    expect(checkIdentity(member, ['medicaid_id', 'dob'], input({ dob: '1968-04-12' }))).toBe(false));
  it('fails when the member has no stored value for a field', () =>
    expect(checkIdentity({ ...member, zipHmac: null }, ['dob', 'zip'], input({ dob: '1968-04-12', zip: '78701' }))).toBe(false));
  it('accepts ZIP+4', () => expect(checkIdentity(member, ['dob', 'zip'], input({ dob: '1968-04-12', zip: '78701-1234' }))).toBe(true));
});

describe('form assignment', () => {
  const rows = [
    { state: 'TX', lineOfBusiness: 'Medicaid', questionnaireId: 'tx-medicaid-hra', priority: 20 },
    { state: null, lineOfBusiness: 'D-SNP', questionnaireId: 'snp-hra', priority: 10 },
    { state: null, lineOfBusiness: null, questionnaireId: 'general-hra', priority: 0 },
  ];
  it('matches state + line of business', () => expect(pickAssignment(rows, { state: 'TX', lineOfBusiness: 'Medicaid' })?.questionnaireId).toBe('tx-medicaid-hra'));
  it('matches line of business in any state', () => expect(pickAssignment(rows, { state: 'AZ', lineOfBusiness: 'D-SNP' })?.questionnaireId).toBe('snp-hra'));
  it('falls back to the catch-all', () => expect(pickAssignment(rows, { state: 'TX', lineOfBusiness: 'Commercial' })?.questionnaireId).toBe('general-hra'));
  it('returns nothing when no row matches', () => expect(pickAssignment(rows.slice(0, 1), { state: 'FL', lineOfBusiness: 'Medicaid' })).toBeUndefined());
});

describe('scheduling', () => {
  const tz = 'America/Chicago';
  it('treats 10pm local as quiet hours', () => expect(inQuietHours(new Date('2026-10-07T03:00:00Z'), tz)).toBe(true)); // 10pm CDT
  it('treats noon local as sendable', () => expect(inQuietHours(new Date('2026-10-07T17:00:00Z'), tz)).toBe(false));
  it('moves a 10pm send to 8am', () => {
    const t = nextAllowedSendTime(new Date('2026-10-07T03:00:00Z'), tz);
    expect(t.toISOString()).toBe('2026-10-07T13:00:00.000Z'); // 8am CDT
  });
  it('skips weekends when adding business days', () => {
    const fri = new Date('2026-10-09T17:00:00Z');
    expect(addBusinessDays(fri, 1, tz).toISOString().slice(0, 10)).toBe('2026-10-12');
  });
  it('counts business days between', () =>
    expect(businessDaysBetween(new Date('2026-10-09T17:00:00Z'), new Date('2026-10-13T17:00:00Z'), tz)).toBe(2));
});
