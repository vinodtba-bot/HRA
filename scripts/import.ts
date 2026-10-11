// Imports a member CSV into a new campaign and queues one invite job per member, high risk first.
// Usage: npm run import -- --file sample/members.csv --campaign "Pilot Oct 2026" [--dry-run]
// Prints a summary, never the rows.
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/db';
import { hmacField } from '../src/lib/crypto';
import { toE164 } from '../src/lib/phone';
import { lookupLineType } from '../src/lib/sms';
import { resolveForm } from '../src/lib/forms';
import { enqueueSend, boss } from '../src/lib/jobs';
import { nextAllowedSendTime } from '../src/lib/schedule';
import { timezoneFor } from '../src/lib/outreach';
import { audit } from '../src/lib/audit';

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

type Row = Record<string, string>;
const REQUIRED = ['plan_member_id', 'first_name', 'phone', 'dob', 'state', 'line_of_business'];

const ageOn = (dob: string, at = new Date()) => {
  const d = new Date(`${dob}T00:00:00Z`);
  let age = at.getUTCFullYear() - d.getUTCFullYear();
  if (at.getUTCMonth() < d.getUTCMonth() || (at.getUTCMonth() === d.getUTCMonth() && at.getUTCDate() < d.getUTCDate())) age--;
  return age;
};

async function main() {
  const file = arg('file');
  const name = arg('campaign') ?? `Campaign ${new Date().toISOString().slice(0, 10)}`;
  const dry = process.argv.includes('--dry-run');
  if (!file) throw new Error('--file is required');

  const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true, trim: true }) as Row[];
  const missingCols = REQUIRED.filter(c => !(c in (rows[0] ?? {})));
  if (missingCols.length) throw new Error(`CSV is missing columns: ${missingCols.join(', ')}`);

  const skipped: Record<string, number> = {};
  const skip = (reason: string) => (skipped[reason] = (skipped[reason] ?? 0) + 1);
  const seenPhones = new Set<string>();
  const seenIds = new Set<string>();
  const accepted: { row: Row; phone: string; formId: string }[] = [];
  const noForm: string[] = [];

  for (const row of rows) {
    if (REQUIRED.some(c => !row[c])) { skip('missing_field'); continue; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dob)) { skip('bad_dob'); continue; }
    if (seenIds.has(row.plan_member_id)) { skip('duplicate_member'); continue; }
    seenIds.add(row.plan_member_id);
    // Pediatric and CHIP members are answered by a guardian: post-MVP.
    if (ageOn(row.dob) < 18 || /chip/i.test(row.line_of_business)) { skip('minor_or_chip'); continue; }
    const phone = toE164(row.phone);
    if (!phone) { skip('invalid_phone'); continue; }
    if (seenPhones.has(phone)) { skip('duplicate_phone'); continue; }
    seenPhones.add(phone);
    const existing = await prisma.member.findUnique({ where: { planMemberId: row.plan_member_id } });
    if (existing?.optedOutAt) { skip('opted_out'); continue; }
    if ((await prisma.member.count({ where: { phoneE164: phone, optedOutAt: { not: null } } })) > 0) { skip('opted_out'); continue; }
    const form = await resolveForm({ state: row.state.toUpperCase(), lineOfBusiness: row.line_of_business });
    if (!form) { skip('no_form'); noForm.push(`${row.state}/${row.line_of_business}`); continue; }
    const lineType = await lookupLineType(phone);
    if (lineType === 'landline') { skip('landline'); continue; }
    accepted.push({ row, phone, formId: form.id });
  }

  const byForm = accepted.reduce<Record<string, number>>((m, a) => ((m[a.formId] = (m[a.formId] ?? 0) + 1), m), {});
  console.log(`rows read: ${rows.length}`);
  console.log(`valid: ${accepted.length}`);
  console.log(`skipped: ${JSON.stringify(skipped)}`);
  console.log(`by form: ${JSON.stringify(byForm)}`);
  if (noForm.length) console.log(`no form assigned for: ${[...new Set(noForm)].join(', ')}`);
  if (dry) return console.log('dry run: nothing written');

  const campaign = await prisma.campaign.create({ data: { name } });
  // High risk first, so the highest-need members are texted first.
  accepted.sort((a, b) => Number(b.row.risk_tier ?? 1) - Number(a.row.risk_tier ?? 1));
  const now = new Date();
  for (const { row, phone } of accepted) {
    const data = {
      firstName: row.first_name,
      phoneE164: phone,
      dobHmac: hmacField('dob', row.dob),
      zipHmac: row.zip ? hmacField('zip', row.zip) : null,
      medicaidIdHmac: row.medicaid_id ? hmacField('medicaid_id', row.medicaid_id) : null,
      language: row.language || 'en',
      state: row.state.toUpperCase(),
      lineOfBusiness: row.line_of_business,
      riskTier: Number(row.risk_tier || 1),
      enrollmentDate: row.enrollment_date ? new Date(`${row.enrollment_date}T00:00:00Z`) : null,
    };
    const member = await prisma.member.upsert({ where: { planMemberId: row.plan_member_id }, create: { planMemberId: row.plan_member_id, ...data }, update: data });
    const inv = await prisma.invitation.create({
      data: { campaignId: campaign.id, memberId: member.id, phoneE164: phone, expiresAt: new Date(now.getTime() + 14 * 86400_000) },
    });
    await audit('issued', inv.id, { actor: 'import' });
    const tz = await timezoneFor(data.state);
    await enqueueSend({ invitationId: inv.id, kind: 'invite' }, { startAfter: nextAllowedSendTime(now, tz), singletonKey: `invite:${inv.id}`, priority: data.riskTier });
  }
  console.log(`campaign "${name}" created; ${accepted.length} invites queued. Run \`npm run worker\` to send them.`);
}

main()
  .catch(e => { console.error(e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await (await boss()).stop({ graceful: false }).catch(() => {}); });
