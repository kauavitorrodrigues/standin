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
4. **Start everything**: `docker compose --profile app up -d --build`. To show the commit in the settings of the app, build with `APP_COMMIT=$(git rev-parse --short HEAD) APP_COMMIT_TIME=$(git show -s --format=%cI HEAD) docker compose --profile app up -d --build`. Without them the settings say only the version. The `app` container applies the migrations before it starts.
5. **Seed the global library once**: `docker compose exec app pnpm --filter api seed:library` (blank maps need it).
6. **Open the domain** in two browsers on different networks, join the same space and check that they hear and see each other.

HTTPS is not optional: browsers only allow the microphone, the camera and screen capture on a secure page. Caddy forwards the WebSocket upgrades of Socket.IO on its own.

## Environment variables

| Variable                                                  | Meaning                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`, `DATABASE_POOL_MAX`                       | The database. The compose file builds the URL from the `POSTGRES_*` values                       |
| `SERVER_PORT`, `SERVER_URL`, `FRONTEND_URL`, `JWT_SECRET` | The API                                                                                          |
| `STORAGE_DRIVER`                                          | Where uploads go, see the [storage guide](storage.md)                                            |
| `SITE_ADDRESS`                                            | The domain Caddy serves                                                                          |
| `MEDIA_WORKERS`                                           | `1` (default) runs the media server, `0` turns it off. One worker serves the whole process       |
| `MEDIA_LISTEN_IP`                                         | The address the media port listens on (`0.0.0.0`)                                                |
| `MEDIA_LISTEN_PORT`                                       | The one port for all media, over UDP and TCP (default `44444`)                                   |
| `MEDIA_ANNOUNCED_ADDRESS`                                 | The public address clients send media to. Required behind a NAT, and on a laptop use `127.0.0.1` |

## Without Docker

Build with `pnpm install --frozen-lockfile && pnpm build` and apply the migrations with `pnpm -C packages/database db:migrate`. Run `apps/api/dist/server.js` under a process manager with automatic restart, and serve `apps/web/dist` from a reverse proxy that forwards `/api` to the API and the WebSocket upgrades. Build the web with `VITE_BASE_API_URL=/api`. `pnpm install` downloads a prebuilt media worker. If none exists for the platform it builds one, which needs Python 3 and a C++ compiler.

## Relay (coturn)

The media server accepts TCP on the same port as UDP, so a relay is only needed by people who block UDP **and** every TCP port except 443. Decide by measurement with real users. Until then `compose.yml` keeps `coturn` behind the `turn` profile and the API keeps `GET /ice-servers`, but the browser does not use them yet. If the measurement shows people who cannot connect, the ICE servers go to the media client. If it does not, remove `apps/api/src/features/ice`, the `turn` profile and the `TURN_*` variables.

## Backups

Everything that matters is the database and the uploads folder. `deploy/backup.sh <folder>` writes a dump and an archive of the uploads, and the file has the two restore commands in its header. Copy the folder **off the machine** (another server or an object store), and test one restore before you need it.

## Operating it

- **Restarts.** The containers use `restart: unless-stopped`, so a crash or a reboot brings everything back. If the media worker alone dies, the API starts a new one and every client rebuilds its media session by itself.
- **Deploys drop every connection.** Each deploy restarts the API, so every socket reconnects and every media session is built again (clients do it by themselves, in a few seconds). Deploy outside working hours.
- **Telemetry.** The API logs a `[Media] - Usage` line every minute with the rooms, peers, transports, producers, consumers and the CPU time of the worker.
- **Provider checks** before paying for a long contract, on the real machine: `iperf3 -u` on the media port (the provider must not filter UDP), and CPU steal under about 5% while under load (`vmstat 1`, column `st`). A shared CPU that is stolen is the usual cause of choppy audio.

None of this requires a paid third-party service. To size a server for more people, see [docs/performance.md](performance.md).
