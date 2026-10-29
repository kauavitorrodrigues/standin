#!/bin/sh
# Applies the migrations, creates the first admin when asked to, then starts
# the API as the one long-lived process of the deployment. The media server runs
# inside it.
set -e

cd /app/packages/database
pnpm exec drizzle-kit migrate

cd /app/apps/api

# The first admin and organization. Only when the password is given: a
# generated one would end up in the logs of the container. Safe on every start,
# it creates nothing once an admin exists.
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
    if [ -f dist/bootstrap.js ]; then
        node dist/bootstrap.js
    else
        echo "ADMIN_EMAIL is set but dist/bootstrap.js is missing, skipping the bootstrap." >&2
    fi
fi

exec node dist/server.js
