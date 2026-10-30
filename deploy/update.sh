#!/bin/sh
# Updates a running deployment: pulls the branch, rebuilds, starts and checks it.
# Runs on the server, from the repository root, or piped over ssh by
# deploy/deploy.sh. Usage: sh deploy/update.sh
# Env: DEPLOY_PATH (default: current folder), DEPLOY_BRANCH (default main),
#      BACKUP_DIR (when set, a backup runs first if migrations are arriving).
set -e

cd "${DEPLOY_PATH:-.}"
branch="${DEPLOY_BRANCH:-main}"

# Edits on the server would be lost or conflict, so stop and let a person look.
if [ -n "$(git status --porcelain)" ]; then
    echo "Working tree is not clean, stopping:" >&2
    git status --short >&2
    exit 1
fi

git fetch origin "$branch"
old="$(git rev-parse --short HEAD)"

if [ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$branch")" ]; then
    echo "Already at $old, nothing new to deploy."
    exit 0
fi

echo "Arriving:"
git log --oneline "HEAD..origin/$branch"

migrations="$(git diff --name-only "HEAD..origin/$branch" -- packages/database/migrations)"
if [ -n "$migrations" ]; then
    echo "New migrations (applied when the app starts):"
    echo "$migrations"
    if [ -n "$BACKUP_DIR" ]; then
        set -a
        . ./.env
        set +a
        ./deploy/backup.sh "$BACKUP_DIR"
    fi
fi

# Never merges or resets: a diverged history is for a person to decide.
git pull --ff-only origin "$branch"

./deploy/up.sh
docker image prune -f

docker compose --profile app ps

# Only the domain is read from .env, never the rest.
domain="$(grep '^SITE_ADDRESS=' .env | cut -d= -f2-)"
for attempt in 1 2 3 4 5 6; do
    health="$(curl -fsS "https://$domain/api/health" 2>/dev/null || true)"
    case "$health" in
        *'"status":"ok"'*)
            echo "Deployed $old -> $(git rev-parse --short HEAD), health ok."
            exit 0
            ;;
    esac
    sleep 5
done

echo "Health check did not answer ok (last answer: ${health:-none}). Check: docker compose logs --tail 80 app" >&2
exit 1
