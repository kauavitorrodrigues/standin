#!/bin/sh
# Writes a dump of the database and an archive of the uploads to a folder, to
# be copied off the machine. Usage: deploy/backup.sh /path/to/backups
# Restore, on an empty database (see "Restoring" in docs/deployment.md):
#   gunzip -c db-<stamp>.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" -v ON_ERROR_STOP=1 -q
#   docker compose run --rm --no-deps -T --entrypoint tar app -xzf - -C /app/apps/api/public < uploads-<stamp>.tar.gz
set -e

target="${1:?Usage: backup.sh <folder>}"
stamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$target"

docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
    | gzip > "$target/db-$stamp.sql.gz"

docker compose run --rm --no-deps --entrypoint tar app \
    -czf - -C /app/apps/api/public . > "$target/uploads-$stamp.tar.gz"

echo "Backup written to $target ($stamp)"
