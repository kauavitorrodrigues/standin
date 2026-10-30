#!/bin/sh
# Deploys the pushed branch to the server over ssh. Usage: pnpm run deploy [--yes]
# Reads deploy.local.env (git-ignored) from the repository root:
#   DEPLOY_SSH=user@host   DEPLOY_PATH=/opt/standin   DEPLOY_BRANCH=main
#   BACKUP_DIR=/opt/backups/standin   (optional, backup before new migrations)
set -e

cd "$(dirname "$0")/.."

if [ ! -f deploy.local.env ]; then
    echo "Missing deploy.local.env, see skills/deploy/SKILL.md" >&2
    exit 1
fi

set -a
. ./deploy.local.env
set +a

: "${DEPLOY_SSH:?DEPLOY_SSH is not set in deploy.local.env}"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/standin}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

# The server builds from the remote, so unpushed work would not be deployed.
git fetch origin "$DEPLOY_BRANCH"
if [ "$(git rev-parse HEAD)" != "$(git rev-parse "origin/$DEPLOY_BRANCH")" ]; then
    echo "HEAD is not origin/$DEPLOY_BRANCH, push (or switch branch) first." >&2
    exit 1
fi

case "$1" in
    --yes) ;;
    *)
        echo "Deploys $(git rev-parse --short HEAD) to $DEPLOY_SSH. The API restarts and drops every connection for a few seconds."
        printf "Continue? [y/N] "
        read -r answer
        case "$answer" in
            y | Y) ;;
            *) exit 1 ;;
        esac
        ;;
esac

# The script is sent over ssh, so it works even before the server has pulled it.
# It runs from a temp file with stdin closed, so docker cannot eat the script.
ssh -o BatchMode=yes "$DEPLOY_SSH" \
    "f=\$(mktemp) && cat > \"\$f\" && DEPLOY_PATH='$DEPLOY_PATH' DEPLOY_BRANCH='$DEPLOY_BRANCH' BACKUP_DIR='$BACKUP_DIR' sh \"\$f\" < /dev/null; rc=\$?; rm -f \"\$f\"; exit \$rc" \
    < deploy/update.sh
