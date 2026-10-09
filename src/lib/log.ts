import pino from 'pino';

/** Structured logs with PHI redacted. Never log answers, phone numbers, DOB or link codes. */
export const log = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: {
    paths: ['dob', 'zip', 'medicaid_id', 'phone', 'phoneE164', 'to', 'answers', 'value', 'code', 'body', '*.dob', '*.phone', '*.phoneE164', '*.answers', '*.code', '*.body'],
    censor: '[redacted]',
  },
});
