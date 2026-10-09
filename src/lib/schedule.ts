// Business days, quiet hours and send slots, all in the member's local time zone.

const QUIET_START = 21; // 9 pm
const QUIET_END = 8; // 8 am

/** Hour and weekday of `d` in time zone `tz`. */
export function localParts(d: Date, tz: string) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23', weekday: 'short' });
  const parts = Object.fromEntries(f.formatToParts(d).map(p => [p.type, p.value]));
  return { hour: Number(parts.hour), weekday: parts.weekday as string };
}

export const isWeekend = (d: Date, tz: string) => ['Sat', 'Sun'].includes(localParts(d, tz).weekday);

export function inQuietHours(d: Date, tz: string) {
  const { hour } = localParts(d, tz);
  return hour >= QUIET_START || hour < QUIET_END;
}

/** The first moment at or after `d`, stepping by 15 minutes, that is inside 8am-9pm local. */
export function nextAllowedSendTime(d: Date, tz: string): Date {
  if (process.env.IGNORE_QUIET_HOURS === '1') return d;
  let t = new Date(d);
  for (let i = 0; i < 4 * 24 && inQuietHours(t, tz); i++) t = new Date(t.getTime() + 15 * 60_000);
  return t;
}

/** Adds n business days (Mon-Fri; plan holidays are not modelled in the MVP). */
export function addBusinessDays(d: Date, n: number, tz: string): Date {
  let t = new Date(d);
  let added = 0;
  while (added < n) {
    t = new Date(t.getTime() + 24 * 3600_000);
    if (!isWeekend(t, tz)) added++;
  }
  return t;
}

/** Business days between two instants (counting whole weekdays after `from`). */
export function businessDaysBetween(from: Date, to: Date, tz: string): number {
  let n = 0;
  for (let t = new Date(from.getTime() + 24 * 3600_000); t <= to; t = new Date(t.getTime() + 24 * 3600_000)) if (!isWeekend(t, tz)) n++;
  return n;
}

/** Each retry goes out at a different time of day: morning, then early evening, then midday. */
export const ATTEMPT_HOURS = [10, 18, 12];

/** The given local hour on the same calendar day as `d` in `tz`. */
export function atLocalHour(d: Date, tz: string, hour: number): Date {
  const { hour: h } = localParts(d, tz);
  const base = new Date(d);
  base.setUTCMinutes(0, 0, 0);
  return new Date(base.getTime() + (hour - h) * 3600_000);
}

/** First outreach deadline by risk tier: 3 business days for tier 3 (high risk), 5 for everyone else. */
export const firstOutreachDeadlineDays = (riskTier: number) => (riskTier >= 3 ? 3 : 5);
