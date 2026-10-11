// Background worker: sends texts, runs the daily outreach pass and the nightly exports.
// Usage: npm run worker
import PgBoss from 'pg-boss';
import { Q, ensureQueues, type SendLinkJob } from '../src/lib/jobs';
import { sendLink, runDailyOutreach } from '../src/lib/outreach';
import { runNightly } from '../src/lib/exports';
import { log } from '../src/lib/log';
import { prisma } from '../src/lib/db';

async function main() {
  const b = new PgBoss({ connectionString: process.env.DATABASE_URL! });
  b.on('error', e => log.error({ err: e.message }, 'pg-boss'));
  await b.start();
  await ensureQueues(b);

  await b.work<SendLinkJob>(Q.sendLink, { batchSize: 5 }, async jobs => {
    for (const j of jobs) {
      const r = await sendLink(j.data);
      log.info({ job: j.id, kind: j.data.kind, result: r }, 'send-link');
    }
  });
  await b.work(Q.outreachDaily, async () => { await runDailyOutreach(); });
  await b.work(Q.nightly, async () => { await runNightly(); });
  await b.work<{ assessmentId: string }>(Q.crisisAlert, async jobs => {
    for (const j of jobs) {
      // Stand-in: page or email the on-call care manager. Wire this to the plan's paging tool before any
      // form with a self-harm question goes live.
      log.error({ assessmentId: j.data.assessmentId, to: process.env.CRISIS_ALERT_EMAIL ?? '(unset)' }, 'CRISIS ALERT: care manager follow-up required');
    }
  });

  // Weekdays at 9:00 and 2:00 Eastern; per-member send times are then shifted to their local slot.
  await b.schedule(Q.outreachDaily, '0 9 * * 1-5', {}, { tz: 'America/New_York' });
  await b.schedule(Q.nightly, '0 2 * * *', {}, { tz: 'America/New_York' });
  log.info('worker started');

  const stop = async () => { await b.stop({ graceful: true }); await prisma.$disconnect(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch(e => { log.error({ err: e.message }, 'worker failed'); process.exit(1); });
