# Connect the app to Twilio (testing on your Mac)

This gets real texts to your own phone from the app running on your Mac. It takes about 20 minutes.
You need the app already running locally (README), a Twilio account, and Homebrew.

Your Mac needs a public HTTPS address for two reasons: the link in the text must open on your phone, and
Twilio must be able to call the app back (delivery reports and STOP replies). A free Cloudflare tunnel gives you one.

## Step 1. Collect your Twilio account values

In the Twilio Console (console.twilio.com), on the home page under **Account Info**, copy:

- **Account SID** (starts with `AC`)
- **Auth Token** (click Show)

## Step 2. Create an API key

Console > **Account** (top right) > **API keys & tokens** > **Create API key**.
Name it `hra-app`, region United States, type **Standard**. Copy the **SID** (starts with `SK`) and the
**Secret**. The secret is shown only once.

## Step 3. Get a phone number

Console > **Phone Numbers** > **Manage** > **Active numbers**. If you have none, click **Buy a number**
(a trial account gets one free) and pick a US number with SMS capability.

## Step 4. On a trial account, verify your own phone

Trial accounts can only text verified numbers. Console > **Phone Numbers** > **Manage** > **Verified Caller IDs** >
**Add a new Caller ID**, then enter your mobile number and the code Twilio texts you.
Trial texts start with "Sent from your Twilio trial account". That's expected.

## Step 5. Start a public tunnel to your Mac

In a new Terminal window:

```
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

It prints an address like `https://random-words.trycloudflare.com`. Copy it and leave this window open.
The address changes every time you restart the tunnel. When it does, repeat steps 6, 7 and 9.

## Step 6. Create the Messaging Service

Console > **Messaging** > **Services** > **Create Messaging Service**.

1. Name: `HRA app`. Use case: **Notify my users**. Click Create.
2. **Add Senders** > Sender type **Phone Number** > tick your number > **Add Phone Numbers**.
3. **Set up integration**: choose **Send a webhook**. In **Request URL**, enter your tunnel address followed by
   `/api/twilio/inbound`, for example `https://random-words.trycloudflare.com/api/twilio/inbound`, method **HTTP POST**.
4. Skip Compliance for now and click **Complete Messaging Service Setup**.
5. Open the service again > **Opt-Out Management** and turn on **Advanced Opt-Out**. Save.
6. Copy the **Messaging Service SID** (starts with `MG`) from the service's Properties page.

## Step 7. Put the values in `.env`

In Terminal, in the `HRA` folder, run `open -e .env` and set these lines (replace each value with yours, with no quotes
and no spaces around `=`):

```
PUBLIC_LINK_BASE=https://random-words.trycloudflare.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_API_KEY=SK...
TWILIO_API_SECRET=...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...
```

`PUBLIC_LINK_BASE` must be the tunnel address exactly, with no `/` at the end. Twilio's webhook signatures are
checked against it. Save and close.

## Step 8. Restart the app in production mode

Stop the worker and the app with Ctrl+C in their windows. Get the latest code, which lets the app accept form
posts through the tunnel address:

```
git pull
```

Then:

- Window 1: `npm run worker`
- Window 2: `npm run build`, then `npm start`

Production mode is closer to the real thing: it requires valid Twilio signatures and secure cookies.
Open your tunnel address in a browser. You should see "Health check-in".

## Step 9. Send yourself a test text

In a third window, in the `HRA` folder, make a one-member list with your own mobile number
(replace `5551234567` with yours):

```
cat > my-test.csv <<'EOF'
plan_member_id,first_name,phone,dob,zip,medicaid_id,language,state,line_of_business,risk_tier,enrollment_date
ME0001,Vinod,5551234567,1980-01-15,78701,TX999999999,en,TX,Medicaid,3,2026-10-01
EOF
npm run import -- --file my-test.csv --campaign "Twilio test"
```

Within a few seconds your phone gets the text. Tap the link and sign in with Medicaid ID `TX999999999` and date of
birth `01/15/1980`.

To test again, run the same import with a new campaign name, for example `--campaign "Twilio test 2"`. Each run
creates a fresh link. A number that replied STOP is skipped until it replies START.

## Step 10. Check it worked

- **Delivery:** open `<tunnel address>/admin` (user `admin`, password from `.env`). The campaign row should show
  `texted 1` and, a few seconds later, `delivered 1`. If texted stays at 0, look at the worker window for an error.
- **Finish the check-in:** you should get a second text, "thanks, your … is complete".
- **STOP:** reply `STOP` to the text. Twilio confirms you're unsubscribed, and `/admin` shows `opted out 1`.
  Reply `START` to opt back in.

## If something goes wrong

| What you see | Likely cause |
|---|---|
| Worker shows `21608` | Trial account: the number isn't verified (step 4) |
| Worker shows `20003` (authenticate) | API key SID or secret is wrong, or the key was made in another region |
| Text arrives, link won't open | Tunnel window closed, or `PUBLIC_LINK_BASE` doesn't match the tunnel address |
| `delivered` never shows; STOP not counted | Webhook URL in step 6 is wrong, or `PUBLIC_LINK_BASE` has a trailing `/` |
| `30034` or `30032` in /admin or the Twilio log | Carrier blocked an unregistered sender: needs 10DLC or toll-free registration |

Twilio's own log of every message and error code: Console > **Monitor** > **Logs** > **Messaging**.

## Before real members

A trial account and a temporary tunnel are for testing only. Before texting members you need an upgraded account,
Twilio's BAA, 10DLC (or toll-free) registration under the plan's legal name, and the app deployed on your own domain.
See [DEPLOY.md](DEPLOY.md).
