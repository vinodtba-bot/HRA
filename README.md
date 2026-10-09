# Headless HRA member app (MVP)

A member gets a text with a short link, confirms who they are with the identity fields their state requires,
answers a one-question-per-screen health risk assessment that saves on every tap, and sees a care plan at the end.
Built from the *Headless HRA App: MVP Build Guide* (steps 1 to 12).

One Next.js 15 app (member screens, short links, API, admin page), Postgres 16 with Prisma, pg-boss for jobs,
Twilio for SMS. Without Twilio credentials, texts go to `.dev-outbox.log` so the whole flow runs locally.

## Run it locally

Needs Node 20+ and Postgres 16.

```bash
cp .env.example .env            # then set IGNORE_QUIET_HOURS=1 and ADMIN_PASSWORD for local use
createdb hra                    # or point DATABASE_URL at any empty Postgres database
npm install
npx prisma migrate deploy       # creates the 13 tables
npm run seed                    # loads forms, form assignments and state identity rules from /forms
npm run import -- --file sample/members.csv --campaign "Local test"
npm run worker                  # sends the queued invites (to .dev-outbox.log); leave it running
npm run dev                     # http://localhost:3000
```

Open a link from `.dev-outbox.log`. Sample identities: TX and FL members verify with Medicaid ID + date of birth
(TX0001: `TX123456789`, `1968-04-12`); AZ members with date of birth + ZIP (AZ0001: `1950-09-21`, `85001`).
The admin funnel is at `/admin` (basic auth from `ADMIN_USER` / `ADMIN_PASSWORD`).

## Tests

```bash
npm test          # 61 unit tests: branching engine, every shipped form, care plan and referral rules,
                  # link codes, identity check, form assignment, quiet hours and business days
npm run e2e       # needs a running app: full member flow in Chromium at 390x844, plus webhooks and outreach cadence
```

The end-to-end run covers: preview bots can't use up a link, no PHI before identity check, wrong DOB refused,
resume on the same question from the same link, Back, completion with care plan and referrals, 5-try lockout,
expired link "Text me a new link", decline with reason, admin login, signed Twilio webhooks (bad number, STOP),
and 3 attempts then a 90-day pause. If Playwright can't find its browser, set `CHROMIUM_PATH`.

## Where things are

| Guide step | Code |
|---|---|
| 2. Schema, token helpers | `prisma/schema.prisma`, `src/lib/crypto.ts` |
| 3. Questionnaire + branching | `src/lib/questionnaire.ts`, `forms/*-hra.json` |
| 3b. Form per state + line of business | `src/lib/forms.ts`, `forms/assignments.json`, `forms/state-policies.json`, `scripts/seed.ts` |
| 4. Phone list import | `scripts/import.ts` |
| 5. Invites, risk-tier order | `src/lib/outreach.ts` (`sendLink`), `src/lib/jobs.ts`, `scripts/worker.ts` |
| 6. Twilio webhooks, dispositions | `src/app/api/twilio/*` |
| 7. Short link | `src/app/r/[code]/route.ts` |
| 8. Identity check, lockout, session | `src/app/start/*`, `src/lib/identity.ts`, `src/lib/session.ts` |
| 9. Question screens, auto-save | `src/app/q/*` |
| 10. Care plan, referrals, crisis, partials | `src/lib/careplan.ts`, `src/app/done`, `src/app/crisis`, `src/lib/exports.ts` |
| 11. Retries, resume nudge, decline, "already did this", new link | `src/lib/outreach.ts`, `src/app/outcomes.ts`, `src/app/expired` |
| 12. Admin funnel, nightly CSVs | `src/app/admin`, `src/lib/exports.ts` (`npm run job -- nightly`) |

Forms are versioned JSON. To change a form, copy it with a new `version` and run `npm run seed`;
a published version is never edited, and members finish on the version they started.

## Choices made where the guide left room

- **Reminder links.** Only a hash of each code is stored, so every text carries a fresh code. The previous code
  stays valid too (`prev_token_hash`), so a member who taps the older text still gets in. "Text me a new link" revokes both.
- **Sessions** store a hash of the cookie value, not the value itself.
- **Coming back after declining** or saying "I already did this": verifying again reopens the same assessment.
- **Minors and CHIP** are skipped at import (guardian flow is post-MVP).
- **Callback buttons** on the care plan record a request that appears in the `callbacks` export.
- **`isHighRisk`** in `src/lib/careplan.ts` is a placeholder (2+ ER visits, fair/poor health with a chronic
  condition, or PHQ-2 ≥ 3). The plan's care management team must supply the real rule.
- **No self-harm question** is in the sample forms. The crisis screen (988 + nurse line), crisis referral and alert job
  are built and unit tested, but the alert only logs until it is wired to a real pager or email.
- **Rate limiting** is in memory, fine for one app instance; move it to Postgres or Redis before scaling out.

## Before any real member data

1. BAAs with AWS and Twilio (confirm Programmable Messaging and Lookup are covered).
2. Twilio: account, Messaging Service with Advanced Opt-Out, 10DLC brand + campaign under the plan's legal name,
   an API key. Set `TWILIO_*` and point the Messaging Service's inbound webhook at `/api/twilio/inbound`.
3. Branded short domain (for example `go.planname.com`) with TLS; set `PUBLIC_LINK_BASE`.
4. Secrets in AWS Secrets Manager: `TOKEN_PEPPER`, `DOB_PEPPER`, `SESSION_SECRET` (32+ random bytes each, never rotated
   casually: changing `DOB_PEPPER` means re-importing members).
5. Hosting: ECS Fargate or App Runner for `npm start` and `npm run worker`, RDS Postgres with KMS.
6. Replace admin basic auth with the plan's SSO + MFA. Send nightly exports to encrypted S3 or the plan's SFTP, not local disk.
7. The pilot questionnaire, the plan's `isHighRisk` definition, and the consent basis (TCPA) and quiet-hours policy.
