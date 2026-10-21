#!/bin/sh
# In AWS the database credentials arrive as separate values from Secrets Manager; build DATABASE_URL from them.
set -e
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-hra}?sslmode=require"
fi
exec "$@"
