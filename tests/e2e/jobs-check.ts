// Checks the Twilio webhooks (signed) and the outreach cadence against the dev database and a running app.
// Usage: npx tsx --env-file=.env tests/e2e/jobs-check.ts
import assert from 'node:assert/strict';
import twilio from 'twilio';
import { prisma } from '../../src/lib/db';
import { runDailyOutreach } from '../../src/lib/outreach';
import { boss } from '../../src/lib/jobs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const post = async (path: string, params: Record<string, string>) => {
  const sig = twilio.getExpectedTwilioSignature(process.env.TWILIO_AUTH_TOKEN!, `${process.env.PUBLIC_LINK_BASE}${path}`, params);
  return fetch(`${BASE}${path}`, { method: 'POST', headers: { 'x-twilio-signature': sig, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
};

(async () => {
  // Unsigned webhook is refused.
  assert.equal((await fetch(`${BASE}/api/twilio/status`, { method: 'POST', body: 'MessageSid=x' })).status, 403);

  // Undelivered with 30006 (landline) marks a bad number.
  const msg = await prisma.message.findFirstOrThrow({ where: { kind: 'invite', invitation: { member: { planMemberId: 'AZ0002' } } } });
  assert.equal((await post('/api/twilio/status', { MessageSid: msg.twilioSid!, MessageStatus: 'undelivered', ErrorCode: '30006' })).status, 204);
  const az = await prisma.member.findUniqueOrThrow({ where: { planMemberId: 'AZ0002' } });
  assert.ok(az.badNumberAt);
  console.log('✓ signed status callback: 30006 marks bad_number; unsigned refused');

  // STOP opts the member out.
  assert.equal((await post('/api/twilio/inbound', { From: '+13055550103', Body: 'STOP', OptOutType: 'STOP' })).status, 200);
  assert.ok((await prisma.member.findUniqueOrThrow({ where: { planMemberId: 'FL0001' } })).optedOutAt);
  console.log('✓ STOP reply records opt-out');

  // Two business days later, non-responders get a reminder; opted-out and bad numbers do not.
  const later = new Date(Date.now() + 4 * 86400_000);
  const r1 = await runDailyOutreach(later);
  console.log('  outreach pass:', r1);
  assert.ok(r1.reminders >= 2, 'TX0001, TX0002, AZ0001 still due a reminder');
  const disp = await prisma.message.count({ where: { disposition: 'delivered_no_response' } });
  assert.ok(disp >= 2);
  console.log('✓ non-responders get the next attempt; earlier attempt marked delivered_no_response');

  // After 3 attempts with no response, outreach pauses 90 days.
  const tx2 = await prisma.invitation.findFirstOrThrow({ where: { member: { planMemberId: 'TX0002' } } });
  for (const n of [2, 3]) await prisma.message.create({ data: { invitationId: tx2.id, kind: 'reminder', attemptNumber: n, status: 'delivered', sentAt: new Date(Date.now() - (4 - n) * 86400_000) } });
  await runDailyOutreach(later);
  const m = await prisma.member.findUniqueOrThrow({ where: { planMemberId: 'TX0002' } });
  assert.ok(m.outreachPausedUntil && m.outreachPausedUntil.getTime() > later.getTime() + 80 * 86400_000);
  console.log('✓ 3 unanswered attempts pause outreach for 90 days');
})()
  .catch(e => { console.error('✗', e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await (await boss()).stop({ graceful: false }).catch(() => {}); });
