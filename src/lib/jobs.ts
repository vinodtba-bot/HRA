import PgBoss from 'pg-boss';

export const Q = {
  sendLink: 'send-link',
  outreachDaily: 'outreach-daily',
  nightly: 'nightly',
  crisisAlert: 'crisis-alert',
} as const;

export type SendLinkJob = { invitationId: string; kind: 'invite' | 'reminder' | 'resume' | 'relink' | 'confirm' };

let producer: Promise<PgBoss> | null = null;

/** A send-only pg-boss instance for the web app. The worker process runs the full instance. */
export function boss(): Promise<PgBoss> {
  return (producer ??= (async () => {
    const b = new PgBoss({ connectionString: process.env.DATABASE_URL!, supervise: false, schedule: false });
    b.on('error', e => console.error('pg-boss', e.message));
    await b.start();
    await ensureQueues(b);
    return b;
  })());
}

export async function ensureQueues(b: PgBoss) {
  for (const name of Object.values(Q)) {
    if (!(await b.getQueue(name))) await b.createQueue(name);
  }
}

export async function enqueueSend(job: SendLinkJob, opts: { startAfter?: Date; singletonKey?: string; priority?: number } = {}) {
  const b = await boss();
  return b.send(Q.sendLink, job, { retryLimit: 3, retryDelay: 60, retryBackoff: true, ...opts });
}
