# Storage guide

Every upload (tileset sheets, asset sprites, thumbnails, chat attachments) goes through a generic `files` entity that only stores metadata (original name, internal file name, extension, MIME type, size) — never the binary itself and never a raw URL. The actual bytes are handled by a pluggable storage driver behind a single `StorageProvider` interface (`upload`/`getUrl`/`delete`), selected instance-wide via `STORAGE_DRIVER` in `.env`:

- **`local` (default)** — files are written to disk on the same server (`public/` by default) and served back through the API. Zero external accounts or credentials needed, so a fresh clone runs end to end without signing up for anything.
- **`s3` (S3-compatible)** — targets any S3-compatible object storage, such as Cloudflare R2, AWS S3, Backblaze B2, or a self-hosted MinIO. Objects are written with their `Content-Type` and an immutable `Cache-Control`, and the bucket is expected to be **public** (ideally behind a custom domain or CDN): `getUrl` returns `S3_PUBLIC_URL/<key>`, and `/files/:id` answers with a redirect there (cached for an hour, so a change of domain does not stick), so the bytes never pass through the API.

    Required variables, all checked when the API boots:

    | Variable                                   | Notes                                                                                                                                                                                                                   |
    | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `S3_ENDPOINT`                              | The service root, e.g. `https://<account>.r2.cloudflarestorage.com`. **Without the bucket name**: the dashboard often shows the URL with `/<bucket>` at the end, and keeping it would put the bucket name in every key. |
    | `S3_BUCKET`                                | Bucket name.                                                                                                                                                                                                            |
    | `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Credentials with read, write and delete on the bucket. On AWS also grant `s3:ListBucket`, otherwise a missing key answers 403 instead of 404.                                                                           |
    | `S3_PUBLIC_URL`                            | Public address of the bucket, with `http(s)://` and without the key.                                                                                                                                                    |
    | `S3_REGION`                                | Optional, defaults to `auto` (what R2 expects).                                                                                                                                                                         |

    The driver only sends checksum headers when the service requires them, so older MinIO releases and other S3-compatible services accept the uploads.

## CORS on the bucket

Behind the redirect, the browser loads every stored image (tilesets, sprites, avatar sheets, thumbnails) from the bucket's origin, which differs from the app's, and Phaser and the avatar editor fetch them with XHR/`fetch`. The bucket therefore needs a CORS rule, or the game renders no tilesets or avatars. On R2 (bucket → Settings → CORS policy):

```json
[
    {
        "AllowedOrigins": ["https://your-app-domain.com"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedHeaders": ["*"],
        "MaxAgeSeconds": 86400
    }
]
```

Use the value of `FRONTEND_URL` as the origin (add `http://localhost:5173` for local development). The requests carry no credentials, so no `Allow-Credentials` is needed.

## Chat attachments

Chat attachments are the exception to direct delivery: they are still read through the API (`FileService.download`, behind the conversation access check) and streamed to the client. They are stored in the same bucket though, so anyone who knows an attachment's key (a uuid) can fetch it from the public URL. If that matters, give attachments a separate private bucket.

Because the client never talks to storage directly — everything is resolved through the API — switching drivers later is a matter of configuration (plus the bucket's CORS rule), not a schema or frontend change. If you do switch after already having uploads, moving the underlying files to the new destination (keeping the same internal file name) is a manual, one-time operation.

## Migrating existing uploads to S3

The database only holds the storage key (`files.file_name`, e.g. `tilesets/<uuid>.png`), never a URL, so the move is a plain copy that keeps the same keys. The uploads live in the `uploads` volume, mounted at `/app/apps/api/public` in the container, so copy them out first:

```
docker compose cp app:/app/apps/api/public ./public

rclone copy ./public r2:<bucket> --progress \
    --header-upload "Cache-Control: public, max-age=31536000, immutable"
rclone check ./public r2:<bucket>
```

(`rclone` needs a remote named `r2` pointing at the bucket; `rclone config` sets it up.) The header makes the old files cache like the ones uploaded after the switch, and `Content-Type` is set by `rclone` from the extension.

Then set the `S3_*` variables and `STORAGE_DRIVER=s3`, and restart. When the API runs with `s3` it no longer serves `/public`, so the old copies stop being reachable; once `rclone check` is clean, the `uploads` volume can be removed. A fresh instance has nothing to migrate.

`deploy/backup.sh` only backs up that volume, so after the switch uploads are no longer covered by it. Back up the bucket instead (for example with `rclone sync` to another bucket or provider).
