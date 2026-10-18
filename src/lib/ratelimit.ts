/**
 * Fixed-window in-memory limiter. Good enough for a single-instance pilot;
 * move to Postgres or Redis before running more than one app instance.
 */
const hits = new Map<string, { n: number; resetAt: number }>();

export function allow(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.resetAt < now) {
    hits.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  h.n += 1;
  return h.n <= limit;
}
