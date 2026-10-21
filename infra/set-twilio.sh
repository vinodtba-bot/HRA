#!/bin/bash
# Copies the Twilio values from your .env into AWS Secrets Manager and restarts the app to pick them up.
# Usage (from the HRA folder): infra/set-twilio.sh [path to .env]
set -euo pipefail
cd "$(dirname "$0")/.."
env_file=${1:-.env}
keys=(TWILIO_ACCOUNT_SID TWILIO_API_KEY TWILIO_API_SECRET TWILIO_AUTH_TOKEN TWILIO_MESSAGING_SERVICE_SID)
val() { grep -E "^$1=" "$env_file" | tail -1 | cut -d= -f2- || true; }
args=()
for k in "${keys[@]}"; do
  v=$(val "$k")
  [ -n "$v" ] || { echo "$k is empty in $env_file. Fill it in and run this again."; exit 1; }
  args+=("$k" "$v")
done
json=$(node -e 'const a=process.argv.slice(1),o={};for(let i=0;i<a.length;i+=2)o[a[i]]=a[i+1];console.log(JSON.stringify(o))' "${args[@]}")
out() { aws cloudformation describe-stacks --stack-name Hra --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
aws secretsmanager put-secret-value --secret-id "$(out TwilioSecret)" --secret-string "$json" >/dev/null
cluster=$(out ClusterName)
for service in "$(out WebService)" "$(out WorkerService)"; do
  aws ecs update-service --cluster "$cluster" --service "$service" --force-new-deployment >/dev/null
done
echo "Twilio values saved. The app restarts with them over the next few minutes."
