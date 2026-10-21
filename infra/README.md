# Deploy to AWS with one command

This folder sets up everything in `docs/DEPLOY.md` section 3 for you: the network, an encrypted private Postgres
database, the web app (2 containers behind an HTTPS load balancer), one worker container, all secrets in
Secrets Manager, an encrypted S3 bucket for exports and member files, crisis alert emails, and an admin login
with MFA. It runs on ECS Fargate, so there are no servers to manage.

Rough cost for a pilot: $120–150 a month (an estimate, mostly the database, load balancer and NAT gateway).

## Before you start (once)

1. **AWS account and BAA.** Sign in to the AWS console. Open **AWS Artifact** > **Agreements** and accept the
   **AWS Business Associate Addendum**.
2. **An access key for your Mac.** IAM > **Users** > **Create user**, name `hra-deploy`, attach the
   **AdministratorAccess** policy. Open the user > **Security credentials** > **Create access key** > "Command Line
   Interface". Copy the key ID and secret.
3. **Tools on your Mac.** In Terminal:
   ```
   brew install awscli
   brew install --cask session-manager-plugin
   aws configure
   ```
   For `aws configure`, paste the key ID and secret, region `us-east-1`, output `json`.
4. **Docker Desktop** must be open and running. The deploy builds the app's image on your Mac.

## Deploy

From the HRA folder:

```
git pull
cd infra
npm install
npx cdk bootstrap
npx cdk deploy
```

`npx cdk bootstrap` is needed only the first time.

Settings are in `infra/cdk.json`. Change them there (or pass `-c name=value`) and deploy again:

| Setting | What it is |
|---|---|
| `domain` | The app's address, `hraapp.ayuhealth.io` |
| `planName`, `nurseLine` | The plan's name and nurse line shown to members |
| `alertEmail` | Who gets crisis alerts. Set it to the care team's on-call address before real members |
| `loginDomainPrefix` | Name for the admin sign-in page. If the deploy says it's taken, pick another |

The first deploy takes about 20–30 minutes. **It pauses at the certificate** until you prove you own the domain:

1. In the AWS console, open **Certificate Manager** (region N. Virginia). Open the certificate for your domain, which
   says "Pending validation". Under **Domains** it shows a **CNAME name** and **CNAME value**.
2. Add that record where the domain's DNS is managed. In Cloudflare: **DNS** > **Add record**, type CNAME, paste the
   name (without the trailing `.ayuhealth.io.` part if Cloudflare adds it itself) and value, proxy status
   **DNS only**. Save.
3. Within a few minutes the certificate turns "Issued" and the deploy carries on.

When it finishes, it prints outputs. Copy `Hra.DnsTarget` (it ends in `elb.amazonaws.com`) and add one more DNS
record: CNAME, name `hraapp`, value the DnsTarget, **DNS only**.

## After the first deploy

1. **Twilio values.** From the HRA folder, run `infra/set-twilio.sh`. It copies the Twilio values from your `.env`
   into AWS and restarts the app.
2. **Twilio webhook.** In Twilio > Messaging > Services > HRA app > Integration, set the Request URL to
   `https://hraapp.ayuhealth.io/api/twilio/inbound` (HTTP POST). This replaces the tunnel address for good.
3. **Check it.** Open `https://hraapp.ayuhealth.io/api/health`. It should show `{"ok":true}`.
4. **Crisis alerts.** AWS emails `alertEmail` a "Subscription Confirmation" message. Click **Confirm subscription**
   in it, or alerts won't arrive.
5. **Admin users.** Each person who uses the admin page gets their own login. Add one with (use their email):
   ```
   aws cognito-idp admin-create-user --user-pool-id "$(aws cloudformation describe-stacks --stack-name Hra --query "Stacks[0].Outputs[?OutputKey=='AdminUserPool'].OutputValue" --output text)" --username you@ayuhealth.io --user-attributes Name=email,Value=you@ayuhealth.io Name=email_verified,Value=true
   ```
   They get an email with a temporary password. At `https://hraapp.ayuhealth.io/admin` they sign in, choose a new
   password, and set up an authenticator app (Google Authenticator, 1Password, Authy) for MFA.
6. **Send yourself a text.** From the HRA folder: `infra/import.sh my-test.csv "AWS test"`. The file is uploaded to
   the encrypted bucket, imported, then deleted.

## Releasing a change

`git pull`, then `cd infra && npx cdk deploy`. The worker applies database changes and reloads forms when it
starts, and the web containers are replaced one at a time with no downtime.

## Good to know

- The database has deletion protection on, and a snapshot is kept if the stack is ever deleted.
- Logs go to CloudWatch (kept one year): ECS console > cluster > service > **Logs**.
- Nightly export CSVs land in the data bucket (output `DataBucket`) under `exports/<date>/`. Download with
  `aws s3 cp --recursive s3://<DataBucket>/exports/2026-10-21/ .` Sending them on to the plan's SFTP is still to do.
- The data bucket and its key are kept if the stack is ever deleted.
