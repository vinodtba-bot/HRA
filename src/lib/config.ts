export const PLAN_NAME = process.env.PLAN_NAME ?? 'Your health plan';
export const PLAN_NURSE_LINE = process.env.PLAN_NURSE_LINE ?? '';
export const linkBase = () => (process.env.PUBLIC_LINK_BASE ?? 'http://localhost:3000').replace(/\/$/, '');

export const SESSION_IDLE_MIN = 30;
export const SESSION_MAX_HOURS = 4;
export const MAX_VERIFY_FAILS = 5;
export const LOCK_MINUTES = 30;
export const MAX_RELINKS_PER_DAY = 3;
export const MAX_OUTREACH_ATTEMPTS = 3;
export const OUTREACH_PAUSE_DAYS = 90;
export const RECHECK_DAYS = 3;
export const RESUME_NUDGE_DAYS = 2;
