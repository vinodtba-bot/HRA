import { describe, it, expect } from 'vitest';
import { generateKeyPairSync, createSign } from 'node:crypto';
import { verifyAlbIdentity } from '../src/lib/alb-auth';
import { parseS3Url } from '../src/lib/storage';

const ALB = 'arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/hra/abc';
const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const fetchKey = async (url: string) => {
  expect(url).toBe('https://public-keys.auth.elb.us-east-1.amazonaws.com/kid-1');
  return pem;
};
// ALB tokens use base64 with padding, which the verifier must accept.
const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
function token(header: object, claims: object) {
  const data = `${enc(header)}.${enc(claims)}`;
  const sig = createSign('SHA256').update(data).sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${data}.${sig.toString('base64').replace(/\+/g, '-').replace(/\//g, '_')}`;
}
const header = { alg: 'ES256', kid: 'kid-1', signer: ALB };
const now = Date.UTC(2026, 9, 21);
const claims = { email: 'care@plan.org', exp: now / 1000 + 60 };

describe('ALB identity header', () => {
  it('accepts a valid token', async () => {
    expect(await verifyAlbIdentity(token(header, claims), ALB, now, fetchKey)).toBe('care@plan.org');
  });
  it('rejects a missing header', async () => {
    expect(await verifyAlbIdentity(null, ALB, now, fetchKey)).toBeNull();
  });
  it('rejects a token from another load balancer', async () => {
    expect(await verifyAlbIdentity(token({ ...header, signer: `${ALB}x` }, claims), ALB, now, fetchKey)).toBeNull();
  });
  it('rejects an expired token', async () => {
    expect(await verifyAlbIdentity(token(header, { ...claims, exp: now / 1000 - 1 }), ALB, now, fetchKey)).toBeNull();
  });
  it('rejects tampered claims', async () => {
    const [h, , s] = token(header, claims).split('.');
    expect(await verifyAlbIdentity(`${h}.${enc({ ...claims, email: 'x@evil.com' })}.${s}`, ALB, now, fetchKey)).toBeNull();
  });
  it('rejects alg none', async () => {
    expect(await verifyAlbIdentity(`${enc({ ...header, alg: 'none' })}.${enc(claims)}.`, ALB, now, fetchKey)).toBeNull();
  });
});

describe('s3 urls', () => {
  it('parses bucket and key', () => {
    expect(parseS3Url('s3://hra-data/imports/a b.csv')).toEqual({ bucket: 'hra-data', key: 'imports/a b.csv' });
    expect(parseS3Url('members.csv')).toBeNull();
  });
});
