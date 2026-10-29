# Deployment guide

Standin is meant to be self-hosted on **one server** (a VPS or bare metal) that runs everything: the web server, the API, PostgreSQL and the media server. There is no platform in front of it, so the machine needs a public UDP port. How to size the server is in [docs/performance.md](performance.md).

The API is a single long-lived process on purpose: the presence, the caches and the media server live in its memory, so run one instance per deployment.

## What runs where

| Piece                               | Where                     | Port                                                     |
| ----------------------------------- | ------------------------- | -------------------------------------------------------- |
| Web build and HTTPS                 | `proxy` container (Caddy) | 80 and 443 over TCP                                      |
| API, Socket.IO and the media server | `app` container           | 3001 inside, never public                                |
| Media (audio, video, screen)        | `app` container           | `MEDIA_LISTEN_PORT` (default 44444) over **UDP and TCP** |
| PostgreSQL                          | `postgres` container      | 5432 inside, never public                                |

The page, the API and the sockets share one origin (`/api` is forwarded to the API), so there is no CORS to configure.

## Setting up a fresh server

1. **Install Docker** with the compose plugin, and point a domain at the public IP of the server.
2. **Get the code** and copy `.env.example` to `.env`. Set at least:
    - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
    - `JWT_SECRET` (a long random value, `openssl rand -hex 32`)
    - `SITE_ADDRESS` (the domain, which makes Caddy get the HTTPS certificate by itself)
    - `SERVER_URL` and `FRONTEND_URL` (both `https://` plus the domain)
    - `MEDIA_ANNOUNCED_ADDRESS` (the **public IP** of the server, the address clients send media to)
3. **Open the firewall**, in the host and in the provider's own firewall: `80` and `443` over TCP, and `MEDIA_LISTEN_PORT` over **UDP and TCP**. The UDP port carries the media. The TCP port on the same number is the fallback for networks that block UDP.
4. **Start everything**: `deploy/up.sh`. It runs `docker compose --profile app up -d --build` with the commit and its time taken from git, so the settings of the app show which commit is running. The same command is the deploy of every later version. Plain `docker compose --profile app up -d --build` also works, and the settings then say only the version. The `app` container applies the migrations before it starts.
5. **Create the first admin and organization.** Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` (optionally `ADMIN_NAME`, default `Admin`, and `ORGANIZATION_NAME`, default `Standin`) before step 4 and the `app` container does it on start, right after the migrations. Or run it by hand: `docker compose exec -e ADMIN_EMAIL=you@example.com app pnpm --filter api bootstrap`. See [First admin](#first-admin) below.
6. **Seed the global library once**: `docker compose exec app pnpm --filter api seed:library` (blank maps need it, and it needs the admin of step 5).
7. **Check it is healthy**: `docker compose ps` shows `app` and `proxy` as `healthy`, and `curl https://<your domain>/api/health` answers with `"status":"ok"`.
8. **Open the domain** in two browsers on different networks, join the same space and check that they hear and see each other.

HTTPS is not optional: browsers only allow the microphone, the camera and screen capture on a secure page. Caddy forwards the WebSocket upgrades of Socket.IO on its own.

## First admin

`pnpm --filter api bootstrap` creates the first admin and the first organization from the environment, with no prompts. It is safe to run again: when an admin already exists it creates no account and never resets a password, and an organization is only created while there is none. It prints one line per step (`admin created`, `admin already exists`, `organization created`...).

- `ADMIN_EMAIL` is required. `ADMIN_PASSWORD` must follow the sign up rules (8 to 72 characters, at least three kinds of character, no obvious sequences).
- Without `ADMIN_PASSWORD` the command generates a strong one and prints it **once**, in that run. Store it right away, it is not saved anywhere else and it is not shown on a later run. Change it after the first sign in.
- The container runs the command on start only when **both** `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, so a generated password never ends up in the container logs. To get a generated password, run the command by hand as in step 5 without setting `ADMIN_PASSWORD`.
- Once the admin exists you can remove `ADMIN_PASSWORD` from `.env`.

## Health checks

The API answers `GET /health` with no session, rate limited to 120 requests a minute per address. The body is `{"status": "ok" | "degraded" | "down", "timestamp": "<ISO date>", "responseTimeMs": <number>}`. The database is checked with a 2 second limit: `ok` when it answers within 500 ms, `degraded` when it answers slower, `down` when it fails or times out. `ok` and `degraded` answer HTTP 200 and `down` answers 503. The body never says why a check failed. Through the proxy it is `/api/health`. `compose.yml` uses it as the healthcheck of `app` (the migrations run inside its start period) and the `proxy` waits for a healthy `app` before it starts. The `proxy` check asks the admin endpoint Caddy keeps inside its container. `docker compose ps` shows the state of each.

## Environment variables

| Variable                                                           | Meaning                                                                                             |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`                | The database container. `POSTGRES_PORT` is only the port it shows on the host of a dev machine      |
| `DATABASE_URL`, `DATABASE_POOL_MAX`                                | The database. The compose file builds the URL from the `POSTGRES_*` values. The pool defaults to 20 |
| `DB_QUERY_COUNT`                                                   | `1` logs the queries sent per join (see [performance](performance.md)). Leave it `0` in production  |
| `SERVER_PORT`, `SERVER_URL`, `FRONTEND_URL`, `JWT_SECRET`          | The API                                                                                             |
| `STORAGE_DRIVER`, `S3_*`                                           | Where uploads go, see the [storage guide](storage.md)                                               |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `ORGANIZATION_NAME` | The first admin and organization, see [First admin](#first-admin)                                   |
| `SITE_ADDRESS`                                                     | The domain Caddy serves                                                                             |
| `APP_COMMIT`, `APP_COMMIT_TIME`                                    | Build arguments that show the commit in the settings of the app (step 4 above)                      |
| `MEDIA_WORKERS`                                                    | `1` (default) runs the media server, `0` turns it off. One worker serves the whole process          |
| `MEDIA_LISTEN_IP`                                                  | The address the media port listens on (`0.0.0.0`)                                                   |
| `MEDIA_LISTEN_PORT`                                                | The one port for all media, over UDP and TCP (default `44444`)                                      |
| `MEDIA_ANNOUNCED_ADDRESS`                                          | The public address clients send media to. Required behind a NAT, and on a laptop use `127.0.0.1`    |
| `TURN_HOST`, `TURN_SECRET`, `TURN_PORT`, `TURN_TTL_SECONDS`        | The optional relay (see below). Off while `TURN_HOST` and `TURN_SECRET` are empty                   |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`  | Sign in with GitHub, see the [guide](github-login.md). Off while empty                              |
| `VITE_BASE_API_URL`                                                | Read when the web is built. The image sets it to `/api`                                             |
| `INTEGRATION_DATABASE_URL`                                         | Tests only. Never set it on a server                                                                |

All of them are in `.env.example` with a comment.

## Without Docker

Build with `pnpm install --frozen-lockfile && pnpm build` and apply the migrations with `pnpm -C packages/database db:migrate`. Create the first admin with `pnpm --filter api bootstrap`. Run `apps/api/dist/server.js` under a process manager with automatic restart, and serve `apps/web/dist` from a reverse proxy that forwards `/api` to the API and the WebSocket upgrades. Build the web with `VITE_BASE_API_URL=/api`. `pnpm install` downloads a prebuilt media worker. If none exists for the platform it builds one, which needs Python 3 and a C++ compiler.

## Relay (coturn)

The media server accepts TCP on the same port as UDP, so a relay is only needed by people who block UDP **and** every TCP port except 443. Until a measurement says otherwise, the relay is **not** used: `compose.yml` keeps `coturn` behind the `turn` profile and the API keeps `GET /ice-servers`, but the browser does not use them.

**Decision: deferred, with the measurement that decides it.** The number needed is how many people who try to join a call cannot get media at all, on UDP and on the TCP fallback of the media port. Nothing records it yet: the `[Media] - Usage` line only has the counts of rooms, peers, transports, producers and consumers, not the protocol each transport ended up on or the ones that never connected. Add that count (for example the selected protocol per transport, and transports that stayed unconnected after a timeout) before deciding, and read it over the first weeks with real people. Then:

- If fewer than about 1 in 100 people who try cannot connect, remove `apps/api/src/features/ice`, the `turn` profile and the `TURN_*` variables.
- If more cannot, pass the ICE servers to the media client, start `coturn` with `docker compose --profile turn up -d coturn` and open `3478` and `49160` to `49200` (UDP) in the firewall.

The 1 in 100 is a starting point to revisit, not a measured limit.

## Backups

Everything that matters is the database and the uploads folder. `deploy/backup.sh <folder>` writes a dump (`db-<stamp>.sql.gz`) and an archive of the uploads (`uploads-<stamp>.tar.gz`). It reads `POSTGRES_USER` and `POSTGRES_DB` from the environment, so load the `.env` first (`set -a; . ./.env; set +a`). Copy the folder **off the machine** (another server or an object store).

If the uploads go to S3 (`STORAGE_DRIVER=s3`), the archive is empty and the bucket has its own backup.

### Restoring

Restore into an **empty** database: the dump creates the tables, so a database that already has them fails. With the same `.env` loaded, from the folder of the code:

1. Stop everything and drop the data of the stack you are replacing: `docker compose --profile app down -v` (this deletes the volumes, so only do it on the machine you mean to rebuild).
2. Start only the database: `docker compose up -d postgres`, and wait until `docker compose ps` says `healthy`.
3. Restore the database: `gunzip -c <folder>/db-<stamp>.sql.gz | docker compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" -v ON_ERROR_STOP=1 -q`
4. Restore the uploads: `docker compose run --rm --no-deps -T --entrypoint tar app -xzf - -C /app/apps/api/public < <folder>/uploads-<stamp>.tar.gz`
5. Start the rest: `deploy/up.sh`. The migrations find the restored journal and apply nothing.

This was tested once on a throwaway stack of the real compose file, with the `app` image built from this code (own project name, ports and volumes, removed afterwards): a marker row and an uploaded file were saved with `backup.sh`, the volumes were deleted, and after the steps above the marker, the file, all 33 tables and all 16 migration records were back and the `app` container started with no error. Not tested: a database with real data in it, a restore on another machine, and a dump from a different version of Postgres.

## Provider checks on the real machine

These need a person on the server and on another network, so they are not run for you. Do them before paying for a long contract. `<IP>` is the public IP of the server and `<PORT>` is `MEDIA_LISTEN_PORT`.

1. **The announced address is the public one.** On the server: `curl -4 https://ifconfig.me`. The answer must be what `MEDIA_ANNOUNCED_ADDRESS` has in `.env`.
2. **The firewall list** is the only thing open, in the host and in the panel of the provider: `80/tcp`, `443/tcp`, `<PORT>/udp`, `<PORT>/tcp`. `3478` and `49160` to `49200` over UDP only if the relay is kept. Check from another network: `nc -zv <IP> 443`, `nc -zv <IP> <PORT>` (TCP) and `nc -zvu <IP> <PORT>` (UDP, which only says "no refusal").
3. **UDP on the media port**, with the app stopped so the port is free. On the server: `iperf3 -s -p <PORT>`. From another network: `iperf3 -c <IP> -p <PORT> -u -b 20M -t 30`. Look at the loss and the jitter of the last line.
4. **TCP on the same port** (the fallback), with the same server command: `iperf3 -c <IP> -p <PORT> -t 30`.
5. **CPU steal while under load**: on the server, `vmstat 1 30` while the load runs (or a real call of the size you expect). Column `st` should stay under about 5%. A shared CPU that is stolen is the usual cause of choppy audio.

The limits (20 Mbit/s, 1% loss, 5% steal) are starting points, not measured ones: pick the bitrate from the size you plan for, using the bandwidth by video quality in [performance](performance.md).

Result template, one row per provider tried:

| Provider and plan | Region | IP matches `MEDIA_ANNOUNCED_ADDRESS` | UDP loss / jitter | TCP rate | Steal (`st`) | Ports open as listed | Keep? |
| ----------------- | ------ | ------------------------------------ | ----------------- | -------- | ------------ | -------------------- | ----- |
|                   |        |                                      |                   |          |              |                      |       |

## Operating it

- **Restarts.** The containers use `restart: unless-stopped`, so a crash or a reboot brings everything back. If the media worker alone dies, the API starts a new one and every client rebuilds its media session by itself.
- **Deploys drop every connection.** Each deploy restarts the API, so every socket reconnects and every media session is built again (clients do it by themselves, in a few seconds). Deploy outside working hours.
- **Telemetry.** The API logs a `[Media] - Usage` line every minute with the rooms, peers, transports, producers, consumers and the CPU time of the worker.
- **Provider checks** before paying for a long contract: see the section below.

## Deploy runbook (outside working hours)

Every deploy drops every connection, so do it when nobody is in a space.

1. **Check it is empty.** Read the last `[Media] - Usage` line (`docker compose logs --tail 20 app | grep Usage`): `peers` should be 0 or the people agreed to be dropped. Write down the `peers` number if it is not 0.
2. **Back up first**: `deploy/backup.sh <folder>` (the commands to restore it are in the Backups section) and note the commit now running (`git rev-parse --short HEAD`).
3. **Deploy**: `git pull`, then `deploy/up.sh`. The `app` container applies the migrations before it starts.
4. **Check**: `docker compose ps` shows `app` and `proxy` up, the logs of `app` have no error, and the Usage line shows the media worker started. Open the domain in two browsers and check they hear and see each other. After a deploy with people in the space, the `peers` number must come back to the one noted in step 1 within a minute, which is the check that everyone reconnected.
5. **Roll back** if a check fails: `git checkout <previous commit>` and `deploy/up.sh` again. The migrations only go forward, so if the new version changed the database and the old code cannot read it, restore the dump of step 2 (Backups section) after stopping `app`.

None of this requires a paid third-party service. To size a server for more people, see [docs/performance.md](performance.md).
