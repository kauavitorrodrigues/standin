#!/bin/sh
# Applies the migrations, then starts the API as the one long-lived process of
# the deployment. The media server runs inside it.
set -e

cd /app/packages/database
pnpm exec drizzle-kit migrate

cd /app/apps/api
exec node dist/server.js
