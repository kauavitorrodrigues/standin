# Storage guide

Every upload (tileset sheets, asset sprites, thumbnails, chat attachments) goes through a generic `files` entity that only stores metadata (original name, internal file name, extension, MIME type, size) — never the binary itself and never a raw URL. The actual bytes are handled by a pluggable storage driver behind a single `StorageProvider` interface (`upload`/`getUrl`/`delete`), selected instance-wide via `STORAGE_DRIVER` in `.env`:

- **`local` (default)** — files are written to disk on the same server (`public/` by default) and served back through the API. Zero external accounts or credentials needed, so a fresh clone runs end to end without signing up for anything.
- **`s3` (S3-compatible)** — targets any S3-compatible object storage, such as Cloudflare R2, AWS S3, Backblaze B2, or a self-hosted MinIO. The driver contract already exists in `packages/infra/src/integrations/storage`; wiring it up to a real provider is the natural next step for anyone running the app beyond a single small server (e.g. multiple API instances, or wanting uploads off the app server entirely).

Because the client never talks to storage directly — everything is resolved through the API — switching drivers later is a matter of configuration, not a schema or frontend change. If you do switch after already having uploads, moving the underlying files to the new destination (keeping the same internal file name) is a manual, one-time operation.
