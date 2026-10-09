// End-to-end check of the member flow at phone size, against a running app (npm run dev).
// Usage: npm run e2e   (BASE_URL defaults to http://localhost:3000)
// Creates its own test members; safe to run repeatedly against a dev database. Never run against production.
import assert from 'node:assert/strict';
import { chromium, type Page } from 'playwright';
import { prisma } from '../../src/lib/db';
import { hashCode, hmacField, newCode } from '../../src/lib/crypto';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const step = (s: string) => console.log(`✓ ${s}`);

async function fixture(tag: string, opts: { state?: string; lob?: string } = {}) {
  const campaign = await prisma.campaign.upsert({ where: { id: '00000000-0000-0000-0000-00000000e2e0' }, create: { id: '00000000-0000-0000-0000-00000000e2e0', name: 'E2E' }, update: {} });
  const id = `E2E-${tag}-${Date.now()}`;
  const member = await prisma.member.create({
    data: {
      planMemberId: id, firstName: 'Testname', phoneE164: '+15125550199', state: opts.state ?? 'TX', lineOfBusiness: opts.lob ?? 'Medicaid', riskTier: 3,
      dobHmac: hmacField('dob', '1968-04-12'), zipHmac: hmacField('zip', '78701'), medicaidIdHmac: hmacField('medicaid_id', 'TX123456789'),
    },
  });
  const code = newCode();
  const inv = await prisma.invitation.create({
    data: { campaignId: campaign.id, memberId: member.id, phoneE164: member.phoneE164!, tokenHash: hashCode(code), expiresAt: new Date(Date.now() + 14 * 86400_000) },
  });
  return { code, inv, member };
}

async function verify(page: Page, code: string, dob = '1968-04-12') {
  await page.goto(`${BASE}/r/${code}`);
  await page.waitForURL('**/start');
  await page.fill('#medicaid_id', 'tx123456789');
  await page.fill('#dob', dob);
  await page.click('button[type=submit]');
}

/** Answers the current question: "Yes", the first option, or a number. */
async function answerCurrent(page: Page) {
  const h1 = await page.textContent('h1');
  if (await page.locator('input[type=number]').count()) {
    await page.fill('input[type=number]', '3');
    await page.click('button:has-text("Continue")');
  } else if (await page.locator('button.choice:has-text("Yes")').count()) {
    await page.click('button.choice:has-text("Yes")');
  } else {
    await page.locator('button.choice').first().click();
  }
  await page.waitForFunction(prev => document.querySelector('h1')?.textContent !== prev, h1);
}

async function main() {
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = () => browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  // 1. A link-preview bot (plain GET, no cookies) does not use up or open the link.
  const a = await fixture('main');
  const bot = await fetch(`${BASE}/r/${a.code}`, { redirect: 'manual' });
  assert.equal(bot.status, 303);
  assert.equal(bot.headers.get('x-robots-tag'), 'noindex, nofollow');
  const afterBot = await prisma.invitation.findUniqueOrThrow({ where: { id: a.inv.id } });
  assert.equal(afterBot.firstOpenedAt, null);
  step('preview bot GET changes nothing');

  // 2. Start page asks for the state's identity fields and shows no name or health content.
  let c = await ctx();
  let page = await c.newPage();
  await page.goto(`${BASE}/r/${a.code}`);
  await page.waitForURL('**/start');
  assert.ok(!page.url().includes(a.code), 'code left the address bar');
  assert.equal(await page.locator('#medicaid_id').count(), 1);
  assert.equal(await page.locator('#dob').count(), 1);
  assert.ok(!(await page.content()).includes('Testname'), 'no name before verification');
  step('start page: Medicaid ID + DOB for TX, no PHI, code out of the URL');

  // 3. Wrong DOB is refused.
  await page.fill('#medicaid_id', 'TX123456789');
  await page.fill('#dob', '1990-01-01');
  await page.click('button[type=submit]');
  await page.waitForSelector('p.error');
  assert.equal((await prisma.invitation.findUniqueOrThrow({ where: { id: a.inv.id } })).failedAttempts, 1);
  step('wrong DOB refused and counted');

  // 4. Correct identity starts the TX form; answer 5 questions then leave.
  await page.fill('#dob', '1968-04-12');
  await page.fill('#medicaid_id', 'TX123456789');
  await page.click('button[type=submit]');
  await page.waitForURL('**/q');
  assert.ok((await page.textContent('main'))!.includes('Care Needs Screening'), 'TX form display name shown');
  for (let i = 0; i < 5; i++) await answerCurrent(page);
  const stoppedAt = await page.textContent('h1');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  assert.ok(width <= 390, `no horizontal scroll at 390px (got ${width})`);
  await page.screenshot({ path: 'tests/e2e/question.png' });
  await c.close();
  step(`verified, answered 5, stopped at "${stoppedAt}"`);

  // 5. Same link, new browser: resumes on the same question after re-verifying.
  c = await ctx();
  page = await c.newPage();
  await verify(page, a.code);
  await page.waitForURL('**/q');
  assert.equal(await page.textContent('h1'), stoppedAt);
  step('resume from the same link lands on the same question');

  // 6. Back opens the previous question with its answer marked.
  await page.click('a:has-text("Back")');
  await page.waitForURL('**/q?edit=*');
  assert.equal(await page.locator('[aria-pressed=true]').count() + (await page.locator('input[type=number]').count()), 1);
  await answerCurrent(page);
  step('back link edits the previous answer');

  // 7. Finish; care plan, referrals and confirmation text are created.
  for (let i = 0; i < 40 && page.url().includes('/q'); i++) await answerCurrent(page).catch(() => {});
  await page.waitForURL('**/done');
  await page.screenshot({ path: 'tests/e2e/done.png', fullPage: true });
  const asmt = await prisma.assessment.findUniqueOrThrow({ where: { invitationId: a.inv.id }, include: { carePlan: true, referrals: true } });
  assert.equal(asmt.status, 'completed');
  assert.equal(asmt.questionnaireId, 'tx-medicaid-hra');
  assert.equal(asmt.completionMethod, 'self_web');
  assert.ok(asmt.carePlan, 'care plan saved');
  const programs = asmt.referrals.map(r => r.program).sort();
  assert.deepEqual(programs, ['care_management', 'maternity', 'sdoh_outreach']);
  const events = (await prisma.auditEvent.findMany({ where: { invitationId: a.inv.id } })).map(e => e.event);
  for (const e of ['opened', 'verify_fail', 'verify_ok', 'answered', 'completed']) assert.ok(events.includes(e), `audit has ${e}`);
  step(`completed with ${(asmt.carePlan!.items as unknown[]).length} care plan items; referrals ${programs.join(', ')}; audit trail complete`);
  await c.close();

  // 8. Five wrong tries lock the link for 30 minutes.
  const b = await fixture('lock');
  c = await ctx();
  page = await c.newPage();
  const submitWrong = async () => {
    await page.fill('#medicaid_id', 'TX123456789');
    await page.fill('#dob', '2000-01-01');
    await Promise.all([page.waitForResponse(r => r.request().method() === 'POST'), page.click('button[type=submit]')]);
  };
  await page.goto(`${BASE}/r/${b.code}`);
  await page.waitForURL('**/start');
  for (let i = 0; i < 5; i++) await submitWrong();
  await page.waitForSelector('p.error');
  assert.match((await page.textContent('p.error'))!, /wait 30 minutes/);
  await page.fill('#dob', '1968-04-12');
  await Promise.all([page.waitForResponse(r => r.request().method() === 'POST'), page.click('button[type=submit]')]);
  await page.waitForTimeout(300);
  assert.ok(page.url().endsWith('/start'), 'still locked with the right DOB');
  step('5 failures lock the link, even the right answer is refused');
  await c.close();

  // 9. Expired link offers a new one, sent to the phone on file.
  const d = await fixture('expired');
  await prisma.invitation.update({ where: { id: d.inv.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
  c = await ctx();
  page = await c.newPage();
  await page.goto(`${BASE}/r/${d.code}`);
  await page.waitForURL('**/expired');
  await page.click('button:has-text("Text me a new link")');
  await page.waitForURL('**/expired?sent=1');
  step('expired link: "Text me a new link" queued');
  await c.close();

  // 10. Decline before starting records a documented outcome.
  const e = await fixture('decline', { state: 'AZ', lob: 'Commercial' });
  c = await ctx();
  page = await c.newPage();
  await page.goto(`${BASE}/r/${e.code}`);
  await page.waitForURL('**/start');
  assert.equal(await page.locator('#zip').count(), 1, 'AZ asks for ZIP');
  await page.click('a:has-text("No thanks")');
  await page.selectOption('#reason', 'no_time');
  await page.click('button:has-text("Stop my check-in")');
  await page.waitForURL('**/goodbye?reason=declined');
  const declined = await prisma.assessment.findUniqueOrThrow({ where: { invitationId: e.inv.id } });
  assert.equal(declined.status, 'declined');
  assert.equal(declined.outcomeReason, 'no_time');
  step('decline recorded with reason; AZ uses DOB + ZIP');
  await c.close();

  // 11. Admin page needs a login.
  assert.equal((await fetch(`${BASE}/admin`)).status, 401);
  const auth = 'Basic ' + Buffer.from(`${process.env.ADMIN_USER}:${process.env.ADMIN_PASSWORD}`).toString('base64');
  const admin = await fetch(`${BASE}/admin`, { headers: { authorization: auth } });
  assert.equal(admin.status, 200);
  assert.ok((await admin.text()).includes('HRA outreach funnel'));
  step('admin funnel requires login');

  await browser.close();
  console.log('\nAll end-to-end checks passed.');
}

main()
  .catch(e => { console.error('✗', e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
