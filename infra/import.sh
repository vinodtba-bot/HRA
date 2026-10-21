#!/bin/bash
# Imports a member CSV into the AWS database by running the import inside the worker container.
# Usage (from the HRA folder): infra/import.sh members.csv "Campaign name" [--dry-run]
# Needs the Session Manager plugin: brew install --cask session-manager-plugin
# For small files only (testing, a few hundred rows). Larger files need an S3 upload step, not built yet.
set -euo pipefail
file=$1; campaign=$2; shift 2
case "$campaign" in *"'"*|*'"'*) echo "Use a campaign name without quotes."; exit 1;; esac
out() { aws cloudformation describe-stacks --stack-name Hra --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
cluster=$(out ClusterName)
task=$(aws ecs list-tasks --cluster "$cluster" --service-name "$(out WorkerService)" --desired-status RUNNING --query 'taskArns[0]' --output text)
[ "$task" != "None" ] || { echo "No worker is running yet. Check the Worker service in the ECS console."; exit 1; }
csv=$(base64 < "$file" | tr -d '\n')
aws ecs execute-command --cluster "$cluster" --task "$task" --container worker --interactive \
  --command "sh -c 'echo $csv | base64 -d > /tmp/import.csv && /app/scripts/docker-entrypoint.sh npm run import:prod -- --file /tmp/import.csv --campaign \"$campaign\" $*; rm -f /tmp/import.csv'"
