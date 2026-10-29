#!/bin/sh
# Builds and starts the deployment, with the commit and its time shown in the
# settings of the app. Usage: deploy/up.sh [extra docker compose up arguments]
set -e

cd "$(dirname "$0")/.."

APP_COMMIT="$(git rev-parse --short HEAD)"
APP_COMMIT_TIME="$(git show -s --format=%cI HEAD)"
export APP_COMMIT APP_COMMIT_TIME

exec docker compose --profile app up -d --build "$@"
