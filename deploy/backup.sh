#!/bin/sh
# Writes a dump of the database and an archive of the uploads to a folder, to
# be copied off the machine. Usage: deploy/backup.sh /path/to/backups
# Restore: gunzip -c db.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB"
#          tar -xzf uploads.tar.gz -C <the volume of /app/apps/api/public>
set -e

target="${1:?Usage: backup.sh <folder>}"
stamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$target"

docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
    | gzip > "$target/db-$stamp.sql.gz"

docker compose run --rm --no-deps --entrypoint tar app \
    -czf - -C /app/apps/api/public . > "$target/uploads-$stamp.tar.gz"

echo "Backup written to $target ($stamp)"
