# Launch, Twilio and AWS deployment

There is no hosted URL yet. The app gets a URL when you deploy it, either the AWS setup below (for real members)
or a throwaway host with fake data (for a demo). Every step here is something you do in your own accounts;
the code needs no changes, only environment values.

- [1. Try it now on your laptop](#1-try-it-now-on-your-laptop)
- [2. Connect Twilio](#2-connect-twilio)
- [3. Deploy to AWS](#3-deploy-to-aws)
- [4. First run after deploy](#4-first-run-after-deploy)
- [5. Before real members](#5-before-real-members)

## 1. Try it now on your laptop

Follow "Run it locally" in the README. The app runs at `http://localhost:3000`. Texts go to `.dev-outbox.log`;
open a link from there. The admin funnel is at `http://localhost:3000/admin`.

To open links on your phone, or to receive Twilio webhooks, the laptop needs a public HTTPS address. Run
`cloudflared tunnel --url http://localhost:3000` (or `ngrok http 3000`), then set `PUBLIC_LINK_BASE` to the
address it prints and restart the app and worker.

**Demo URL with fake data only.** Any host that runs a Node web service, a background worker and Postgres works
(for example Render or Railway): web command `npm run db:deploy && npm run seed:prod && npm start`,
worker command `npm run worker:prod`, and the environment values from `.env.example`. Never load real member data
there: those hosts are not under your BAA.

## 2. Connect Twilio

1. **Account.** Create a Twilio account and upgrade it. A trial account can only text phone numbers you have
   verified in the console, which is enough to test with your own phone. Before any PHI flows, request Twilio's BAA
   and confirm it covers Programmable Messaging and Lookup.
2. **Sender number.** Buy a local (10DLC) number, or a toll-free number. Toll-free verification is often faster
   than 10DLC for a pilot.
3. **Registration.** US carriers block unregistered application texting. For 10DLC, register a Brand (the plan's
   legal name and EIN), then a Campaign. Choose the "Customer Care" use case and paste the invite and reminder texts
   from `src/lib/messages.ts` as sample messages. Approval commonly takes 1 to 3 weeks. For toll-free, submit
   Toll-Free Verification with the same samples.
4. **Messaging Service.** Console > Messaging > Services > Create.
   - Sender Pool: add the number.
   - Integration > Incoming messages: "Send a webhook", URL `https://<your domain>/api/twilio/inbound`, method POST.
   - Opt-Out Management: turn on Advanced Opt-Out, so Twilio answers STOP, HELP and START itself.
   - Copy the Service SID (`MG…`).
5. **API key.** Console > Account > API keys > Create, type Standard. Copy the key SID (`SK…`) and secret.
6. **Values for the app:**

   | Variable | Where it comes from |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | Console home, `AC…` |
   | `TWILIO_API_KEY` / `TWILIO_API_SECRET` | Step 5 |
   | `TWILIO_AUTH_TOKEN` | Console home. Used only to check webhook signatures |
   | `TWILIO_MESSAGING_SERVICE_SID` | Step 4, `MG…` |
   | `PUBLIC_LINK_BASE` | Your public HTTPS address, for example `https://go.planname.com` |

   With all four `TWILIO_*` sending values set, the app sends real texts. Each send asks Twilio to report delivery to
   `PUBLIC_LINK_BASE/api/twilio/status`, and the import uses Lookup to skip landlines. Webhook signatures are checked
   against `PUBLIC_LINK_BASE`, so it must be exactly the address Twilio calls, with no trailing slash.
7. **Test.** Put your own number in a one-row CSV, import it and let the worker send. Tap the link, then reply STOP
   and check that `/admin` counts one opt-out.

## 3. Deploy to AWS

The target layout is one Docker image running as two ECS Fargate services (web and worker), RDS Postgres, and an
HTTPS load balancer on the plan's short domain. All of it is HIPAA-eligible under the AWS BAA.

```
go.planname.com ──HTTPS──> ALB ──> ECS service "web"    (npm start, port 3000)
                                   ECS service "worker" (npm run worker:prod)
                                   both ──> RDS Postgres 16 (private, encrypted)
                                   secrets from AWS Secrets Manager
```

**The quick way:** [`infra/README.md`](../infra/README.md) sets all of this up with one command (AWS CDK). The steps
below are the same layout done by hand in the AWS console and CLI, in `us-east-1`. Replace `<acct>` with your AWS account ID.

1. **BAA.** AWS Artifact > Agreements > accept the AWS Business Associate Addendum for the account.
2. **Network.** Use a VPC with two public subnets (for the load balancer) and two private subnets with a NAT gateway
   (for the tasks and the database). The console's "VPC and more" wizard creates this in one screen. Create three
   security groups:
   - `hra-alb`: inbound 443 from anywhere.
   - `hra-app`: inbound 3000 from `hra-alb`.
   - `hra-db`: inbound 5432 from `hra-app`.
3. **Database.** RDS > Create database: PostgreSQL 16, `db.t4g.small` is enough for the pilot, storage encryption on
   (KMS), not publicly accessible, private subnets, security group `hra-db`, automated backups on. Note the endpoint.
4. **Secrets.** Secrets Manager > Store a new secret > "Other type", named `hra/app`, with these keys:
   `DATABASE_URL` (`postgresql://<user>:<password>@<rds endpoint>:5432/hra?sslmode=require`),
   `TOKEN_PEPPER`, `DOB_PEPPER` and `SESSION_SECRET` (each from `openssl rand -base64 48`; never change `DOB_PEPPER`
   once members are imported), `TWILIO_ACCOUNT_SID`, `TWILIO_API_KEY`, `TWILIO_API_SECRET`, `TWILIO_AUTH_TOKEN`,
   `TWILIO_MESSAGING_SERVICE_SID`, and `ADMIN_USER` and `ADMIN_PASSWORD`.
   Plain (non-secret) values go in the task definition instead: `PUBLIC_LINK_BASE`, `PLAN_NAME`, `PLAN_NURSE_LINE`.
5. **Image.** Create the ECR repository `hra-app`, then from the repo root:
   ```bash
   aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t <acct>.dkr.ecr.us-east-1.amazonaws.com/hra-app:v1 .
   docker push <acct>.dkr.ecr.us-east-1.amazonaws.com/hra-app:v1
   ```
6. **Task definitions** (ECS > Task definitions > Create, Fargate, Linux/X86_64, 0.5 vCPU / 1 GB):
   - `hra-web`: image `…/hra-app:v1`, port 3000, environment from the `hra/app` secret (one entry per key, "ValueFrom"
     the secret's ARN with `:KEY::` suffix) plus the plain values. Logs to CloudWatch.
   - `hra-worker`: same image and environment, command override `npm,run,worker:prod`, no port.
   - The task execution role needs `secretsmanager:GetSecretValue` on `hra/app`.
7. **Certificate and load balancer.** ACM > request a public certificate for `go.planname.com` (DNS validation).
   EC2 > Load balancers > Application Load Balancer: internet-facing, public subnets, security group `hra-alb`,
   HTTPS 443 listener with the certificate, and a redirect from 80 to 443. Target group: type IP, port 3000, health
   check path `/api/health`.
8. **Services.** ECS > create a cluster `hra` (Fargate), then two services in the private subnets with security group
   `hra-app` and public IP off:
   - `web` from `hra-web`, 2 tasks, attached to the target group above.
   - `worker` from `hra-worker`, exactly 1 task.
9. **DNS.** Point `go.planname.com` at the load balancer (Route 53 alias record, or a CNAME at your DNS provider).
   `https://go.planname.com/api/health` should return `{"ok":true}`.
10. **Twilio.** Set the Messaging Service's incoming-message webhook to `https://go.planname.com/api/twilio/inbound`.

## 4. First run after deploy

Run each of these once as a one-off ECS task from the `hra-web` task definition, with a command override
(ECS > cluster > Tasks > Run new task, same subnets and security group):

| Task | Command override | When |
|---|---|---|
| Create tables | `npx,prisma,migrate,deploy` | First deploy, then before every release |
| Load forms and state rules | `npm,run,seed:prod` | First deploy, and whenever `forms/` changes |

To import members, run the import from a machine that can reach the database, for example your laptop through an
SSM port-forwarding session to a small bastion host. Set the same `DATABASE_URL` (pointing at the tunnel),
`TOKEN_PEPPER`, `DOB_PEPPER` and `TWILIO_*` values, then:

```bash
npm run import:prod -- --file members.csv --campaign "Pilot wave 1" --dry-run   # check the summary first
npm run import:prod -- --file members.csv --campaign "Pilot wave 1"
```

The worker in AWS picks up the queued invites. Check the funnel at `https://go.planname.com/admin`.

**Releasing a change:** build and push a new image tag, run the migrate task, then update both services to the new
task definition revision.

## 5. Before real members

- BAAs signed with AWS and Twilio; 10DLC or toll-free registration approved.
- Admin page login with MFA: done in `infra/` (Cognito). Connecting it to the plan's own SSO is a later option.
- Nightly exports go to the encrypted S3 bucket (`infra/`); forwarding them to the plan's SFTP is still to do.
- Crisis alerts email the care team (`alertEmail` in `infra/cdk.json`); confirm the subscription email.
- CloudWatch log retention set, and an alarm on the `/api/health` target and on worker task restarts.
- Confirm the plan's texting consent basis (TCPA) and quiet-hours policy.
- Decide the pilot questionnaire and the plan's high-risk definition (see the README).
