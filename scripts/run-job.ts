// Runs one scheduled job immediately, for testing: npm run job -- outreach | nightly
import { runDailyOutreach } from '../src/lib/outreach';
import { runNightly } from '../src/lib/exports';
import { prisma } from '../src/lib/db';
import { boss } from '../src/lib/jobs';

const which = process.argv[2];
(async () => {
  if (which === 'outreach') console.log(await runDailyOutreach());
  else if (which === 'nightly') console.log(await runNightly());
  else throw new Error('usage: npm run job -- outreach | nightly');
})()
  .catch(e => { console.error(e.message); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await (await boss()).stop({ graceful: false }).catch(() => {}); });
