// Applies the plan's answer to the "I already did this" recheck export.
// Input CSV: plan_member_id,result  where result is confirmed or not_found.
// confirmed -> stays reported_complete; not_found -> outreach resumes on the next daily pass.
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { prisma } from '../src/lib/db';
import { setDisposition } from '../src/lib/outreach';

(async () => {
  const file = process.argv[2];
  if (!file) throw new Error('usage: npm run recheck -- results.csv');
  const rows = parse(fs.readFileSync(file), { columns: true, skip_empty_lines: true, trim: true }) as { plan_member_id: string; result: string }[];
  const counts = { confirmed: 0, resumed: 0, not_matched: 0 };
  for (const r of rows) {
    const a = await prisma.assessment.findFirst({
      where: { status: 'reported_complete', invitation: { member: { planMemberId: r.plan_member_id } } },
    });
    if (!a) { counts.not_matched++; continue; }
    if (r.result === 'confirmed') {
      await prisma.assessment.update({ where: { id: a.id }, data: { recheckAt: null, outcomeReason: 'confirmed_by_plan' } });
      counts.confirmed++;
    } else {
      await prisma.assessment.update({ where: { id: a.id }, data: { status: 'in_progress', recheckAt: null, completedAt: null, outcomeReason: 'not_found_on_recheck' } });
      await prisma.invitation.update({ where: { id: a.invitationId }, data: { verifiedAt: null } });
      await setDisposition(a.invitationId, 'delivered_no_response', 'reported complete but not found');
      counts.resumed++;
    }
  }
  console.log(counts);
})()
  .catch(e => { console.error(e.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
