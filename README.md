<div align="center">

![Repository](https://img.shields.io/badge/repository-public-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![Node](https://img.shields.io/badge/node-%3E%3D20-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![pnpm](https://img.shields.io/badge/pnpm-11%2B-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-6.x-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)

A 2D top-down virtual space for small teams, with customizable maps and real-time presence over WebRTC/P2P.

[Overview](#overview) • [Features](#features) • [How It Works](#how-it-works) • [Architecture](#architecture) • [Storage](#storage) • [Getting Started](#getting-started) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

## Overview

Stand!N is a 2D top-down virtual space platform for small teams (2 to 10 people), inspired by tools like Gather and classic Habbo Hotel. Each `Organization` is the platform's tenant: it owns its members, its spaces (`Space`), and the maps (`Map`) those spaces use to render the world in Phaser.

The product goal is to give a small team a navigable "virtual office" — a customizable map and real-time presence between teammates, with no dependency on paid third-party services beyond the server the app runs on.

## Features

- **Multi-tenant organizations**: each `Organization` isolates its own members (`organization_members`, `OWNER`/`MEMBER` roles) and spaces.
- **Spaces (`Space`)**: a space belongs to exactly one organization and is always tied to a `Map`, from which it inherits dimension (`width`/`height`) and `tileSize`.
- **Global and private map catalog**: a `Map` can be a system-wide global map (`organization_id = NULL`, available to every organization on the instance) or private to a specific organization — designed for a self-hosted/open-source scenario, where the person running the instance is distinct from whoever administers each organization.
- **User-uploaded maps**: maps aren't limited to a built-in catalog — an organization can author its own map in Tiled and upload it (map JSON, thumbnail, and one or more tilesets) straight into the instance, so any team can bring its own layout and assets instead of being stuck with defaults.
- **Maps authored in Tiled**: maps are drawn in the [Tiled](https://www.mapeditor.org/) editor, exported as JSON, and validated by a custom parser (Zod) before reaching Phaser.
- **Abstracted file storage**: a generic, reusable `files` entity (map JSON, tilesets, thumbnails, and eventually avatars) sitting behind a pluggable storage driver, so the instance operator picks where uploads actually live (see [Storage](#storage) below).
- **Self-hostable**: no mandatory third-party service — run your own instance with just a server and a PostgreSQL database (see [Deployment](#deployment) below).
- **Phaser game engine**: the space is rendered full-screen via Phaser 3 (real tilemap, ground/collision/special-zone layers), with the product UI (toolbar, sidebar) overlaid on top of the canvas.
- **Own auth**: password-based sign-up/login (bcrypt) and JWT, with no external provider dependency.

## How It Works

### Data hierarchy

```
User
 └─< organization_members >── Organization
                                   ├─< organization_invites
                                   └─< Space ── map_id ──> Map
                                                             ├─ map_json_file_id ──> File (Tiled JSON)
                                                             ├─ thumbnail_file_id ──> File (preview)
                                                             └─< map_tilesets >──> File (tilesets)
```

- A user can belong to N organizations; an organization can have N users and N spaces.
- A space belongs to exactly one organization and is always tied to a map — `width`/`height`/`tileSize` are a property of the map, not of the space.
- `Map` can be global (`organization_id IS NULL`, the instance's default catalog) or private to an organization; the list of maps available to an organization combines both.
- `files` is the generic entity behind every upload (map JSON, tileset, thumbnail); it stores metadata, not the binary — the public URL is resolved by the storage layer at use time.
- Space access, today, follows straight from the organization: every active member can access every space in it — no per-space permission table at this stage.

All tables use soft delete via `deleted_at`, with uniqueness always scoped to active records.

### From map to rendered world

When a `Space` loads, the app resolves the chain: `Space → Map → (map JSON + thumbnail + tilesets)`, assembles a consolidated payload (dimension, JSON URL, list of named tilesets), and hands it to Phaser, which builds the scene from the tilemap — nothing hardcoded on the frontend.

### Real-time presence

At scale, the target is 2 to 10 concurrent people per room — small enough for a mesh P2P topology (every peer connected to every peer), with no need for an SFU or dedicated streaming infrastructure. Teammates in the same space see each other move and can talk over proximity-based audio/video.

## Storage

Every upload (map JSON, tilesets, thumbnails) goes through a generic `files` entity that only stores metadata (original name, internal file name, extension, MIME type, size) — never the binary itself and never a raw URL. The actual bytes are handled by a pluggable storage driver behind a single `StorageProvider` interface (`upload`/`getUrl`/`delete`), selected instance-wide via `STORAGE_DRIVER` in `.env`:

- **`local` (default)** — files are written to disk on the same server (`public/` by default) and served back through the API. Zero external accounts or credentials needed, so a fresh clone runs end to end without signing up for anything.
- **`s3` (S3-compatible)** — targets any S3-compatible object storage, such as Cloudflare R2, AWS S3, Backblaze B2, or a self-hosted MinIO. The driver contract already exists in `packages/infra/src/integrations/storage`; wiring it up to a real provider is the natural next step for anyone running the app beyond a single small server (e.g. multiple API instances, or wanting uploads off the app server entirely).

Because the client never talks to storage directly — everything is resolved through the API — switching drivers later is a matter of configuration, not a schema or frontend change. If you do switch after already having uploads, moving the underlying files to the new destination (keeping the same internal file name) is a manual, one-time operation.

## Architecture

A `pnpm` + Turborepo monorepo with two deployable apps (`web`, `api`) and shared packages between them:

- `web` is the React SPA that renders both the product UI (dashboard, organizations, spaces) and the game itself (Phaser inside a `<canvas>`, isolated from React's render cycle).
- `api` is the Express HTTP layer: auth, organization/space/map CRUD, file upload/storage, and WebSocket signaling for WebRTC.
- Contracts, Zod schemas, and domain types shared between `web` and `api` live in `packages/contracts`, so both sides never drift from the same data shape.

```text
.
├── apps/
│   ├── web/                 # Frontend (Vite + React + Phaser)
│   └── api/                 # HTTP backend (Express + TS)
├── packages/
│   ├── contracts/           # Shared Zod schemas, types, and errors (auth, maps, spaces, organizations, files)
│   ├── core/                # Domain logic
│   ├── database/            # Drizzle ORM + PostgreSQL (schema, migrations, seed)
│   ├── infra/                # Technical integrations (storage, etc.)
│   └── config/
│       ├── tsconfig/         # TS presets
│       ├── eslint/            # Shared ESLint preset
│       ├── prettier/          # Shared Prettier preset
│       └── vitest/             # Vitest presets
├── compose.yml                 # Local infra (PostgreSQL)
├── package.json                # Root scripts and devDependencies
├── pnpm-workspace.yaml          # Workspace declarations
├── turbo.json                   # Turborepo pipeline config
├── prettier.config.cjs          # Root Prettier config
└── .env / .env.example
```

### Stack

| Layer | Technologies |
| --- | --- |
| Workspace | pnpm 11, Turborepo |
| Frontend | React 19, Vite, TailwindCSS, TanStack Router, TanStack Query, Base UI, Phaser 3, React Hook Form + Zod |
| Backend | Express 5, TypeScript, JWT, bcrypt, Multer |
| Database | PostgreSQL, Drizzle ORM |
| Maps | Tiled (authoring), JSON validated via Zod |
| Networking | WebRTC, WebSocket (signaling), Yjs |
| Quality | ESLint, Prettier, Vitest, TypeScript |

### Key domain entities

| Entity | Description |
| --- | --- |
| `User` | User account; email unique among active records, hashed password |
| `Organization` | Platform tenant; has an `owner_id` and a unique `slug` |
| `OrganizationMember` | N:N link between `User` and `Organization`, with `OWNER`/`MEMBER` role |
| `OrganizationInvite` | Pending invite for a user to join an organization |
| `Space` | Navigable space; belongs to an `Organization` and always references a `Map` |
| `Map` | Registered map (dimension, `tileSize`, Tiled JSON, thumbnail); global or private to an organization |
| `MapTileset` | Join between `Map` and `File`, one tileset per row, matched by the name declared in the Tiled JSON |
| `File` | Generic upload entity (map JSON, tileset, thumbnail); stores metadata, not the binary |

## Getting Started

### Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 20+ |
| pnpm | 11+ |
| Docker | latest |
| Docker Compose | latest |

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` at the repo root and fill in the values:

```bash
cp .env.example .env
```

```env
# API
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=standin
POSTGRES_PORT=5436

DATABASE_URL="postgresql://postgres:postgres@localhost:5436/standin?schema=public"

SERVER_PORT=3001
SERVER_URL="http://localhost:3001"
JWT_SECRET="change-me"
FRONTEND_URL="http://localhost:5173"

# defaults to "local" if omitted
STORAGE_DRIVER=local

# WEB
VITE_BASE_API_URL="http://localhost:3001"
```

### 3. Start local infrastructure

```bash
docker compose up -d
```

Starts PostgreSQL at `127.0.0.1:${POSTGRES_PORT}` (default `5436`).

### 4. Prepare database

```bash
pnpm -C packages/database db:migrate
pnpm -C packages/database db:seed
```

### 5. Start development

```bash
pnpm dev
```

## Scripts

### Root scripts

```bash
pnpm dev              # Run all apps in watch mode (Turborepo)
pnpm build            # Build all packages and apps
pnpm lint             # Lint all code
pnpm check-types      # TypeScript type checking
pnpm test             # Run all tests
pnpm format           # Format all code (Prettier)
pnpm format:check     # Check formatting without changing files
```

### Database scripts

```bash
pnpm -C packages/database db:generate   # Generate a new migration (Drizzle Kit)
pnpm -C packages/database db:migrate    # Apply pending migrations
pnpm -C packages/database db:studio     # Open Drizzle Studio
pnpm -C packages/database db:seed       # Seed the database with development data
```

## Deployment

Standin is meant to be self-hosted: the only hard requirement is a server (VPS, bare metal, whatever you already run) and a PostgreSQL database — no proprietary platform lock-in.

`web` and `api` are deployed separately: `api` never serves the frontend bundle, it only serves locally-stored uploads under `/public`.

1. **Provision PostgreSQL.** Either the bundled `compose.yml` service on the same host, or any managed/self-hosted instance reachable from `api`. Point `DATABASE_URL` at it.
2. **Build both apps** from the repo root: `pnpm install --frozen-lockfile && pnpm build`.
3. **Apply migrations**: `pnpm -C packages/database db:migrate`.
4. **Run the API** (`apps/api/dist/server.js`) as a long-lived Node process behind a process manager (PM2, systemd, Docker — your choice) and a reverse proxy (nginx, Caddy) for TLS. Required env vars: `DATABASE_URL`, `SERVER_PORT`, `SERVER_URL` (the API's own public URL — used to build links to locally-stored files), `JWT_SECRET`, `FRONTEND_URL` (used for CORS), and `STORAGE_DRIVER` (see [Storage](#storage)).
5. **Serve the web build** (`apps/web/dist`, a static bundle) from any static host or the same reverse proxy, with `VITE_BASE_API_URL` pointed at the API's public URL at build time.
6. **Pick a storage strategy**: `local` works out of the box on a single server but ties uploads to that machine's disk; an S3-compatible provider (Cloudflare R2, etc.) is the better fit once you're running more than one API instance or want uploads decoupled from the app server.

None of this requires a paid third-party service — a single small VPS running Postgres, the API process, and the static web build is enough for a small team.

## Maintenance Notes

- Dependencies are saved with exact versions (no `^`), via `saveExact`/`savePrefix` in `pnpm-workspace.yaml`.
- `packages/contracts` is the shared source of truth for schemas/types between `web` and `api` — any API contract change goes through it first.
