<div align="center">
	<img src="assets/logo.png" alt="Stand!N logo" width="220" />

<br>

<br>

![Repository](https://img.shields.io/badge/repository-public-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![Node](https://img.shields.io/badge/node-%3E%3D20-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![pnpm](https://img.shields.io/badge/pnpm-11%2B-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-6.x-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)

A 2D top-down virtual space for small teams, with a built-in map editor, real-time presence over WebRTC/P2P, text/attachment chat, proximity voice, and proximity camera and screen sharing.

[Overview](#overview) • [Features](#features) • [How It Works](#how-it-works) • [Map Editor](#map-editor) • [Architecture](#architecture) • [Storage](#storage) • [Getting Started](#getting-started) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

## Overview

Stand!N is a 2D top-down virtual space platform for small teams, inspired by tools like Gather and classic Habbo Hotel. Each `Organization` is the platform's tenant: it owns its members, its spaces (`Space`), and the maps (`Map`) those spaces render in Phaser.

The product goal is to give a small team a navigable "virtual office" with real-time presence between teammates, and to let them build that office themselves. There is no external map tool: the platform ships a complete map editor. You upload your own art (tileset sheets and object sprites), and then assemble tilesets, objects, areas, rooms, and whole maps inside the app. It has no dependency on paid third-party services beyond the server it runs on.

## Features

- **Multi-tenant organizations**: each `Organization` isolates its own members (`organization_members`, `OWNER`/`MEMBER` roles) and spaces.
- **Spaces (`Space`)**: a space belongs to exactly one organization and owns exactly one `Map`. The map is created together with the space, either blank (by size tier) or copied from a published template.
- **Built-in map editor**: tile painting, objects, areas, rooms with doors, zones, undo/redo, and a draft-then-publish flow, all inside the platform (see [Map Editor](#map-editor)).
- **Asset library**: upload your own PNGs as tilesets or placeable objects, with footprint and collision painted in the browser. The library is global (managed by the instance admin) or private to an organization (managed by its owner).
- **Reusable areas**: capture a block of tiles, objects, and an optional zone as an area, and stamp it onto any map.
- **Rooms and doors**: a room is a private zone with walls and doors. Doors can be locked, and people outside ask to join. Communication is limited to the people in the same room.
- **Custom avatars**: each person builds an avatar from parts (skin, hair, clothes, accessories) in an editor, and everyone in the space sees it change live. Whoever has none is a ghost. The full guide is in [docs/avatar.md](docs/avatar.md).
- **Profile picture**: each person can upload a photo (cropped and shrunk on the server) that shows in lists, the chat and the name tag, and updates live for everyone in the space. It is separate from the avatar. See [docs/profile-picture.md](docs/profile-picture.md).
- **Desks and seats**: members claim a desk, and avatars sit on seats. Each member can decorate the items on their own desk.
- **Map templates**: the admin builds complete maps and publishes them as templates, which organization owners pick from when creating a space.
- **Abstracted file storage**: a generic `files` entity behind a pluggable storage driver, so the instance operator picks where uploads actually live (see [Storage](#storage) below).
- **Self-hostable**: no mandatory third-party service. Run your own instance with just a server and a PostgreSQL database (see [Deployment](#deployment) below).
- **Phaser game engine**: the space is rendered full-screen via Phaser 3, with the product UI (toolbar, sidebar) overlaid on top of the canvas.
- **Own auth**: password-based sign-up/login (bcrypt) and JWT, with no external provider dependency.
- **Chat messaging**: text and attachment messages, in two conversation shapes: a `DIRECT` conversation between two members, or a `SPACE` conversation shared by every member of that space (both scoped to the organization).
- **Proximity voice chat**: peer-to-peer voice over WebRTC that unlocks automatically between two users when their avatars get close enough inside a space.
- **Proximity camera and screen sharing**: the same rule as voice, applied to video. Only the people in range receive it, and videos render centered over the map.

## How It Works

### Data hierarchy

```
User
 └─< organization_members >── Organization
                                   ├─< organization_invites
                                   ├─< Space ── map_id ──> Map
                                   │             └─< desk_assignments (desk ↔ user)
                                   ├─< tilesets  (private library)
                                   ├─< assets    (private library)
                                   └─< areas     (private library)

Map
 ├─ layout (jsonb: tile layers + zones)
 └─< map_assets ──> assets (objects placed on the map)

MapTemplate ── map_id ──> Map     (admin-built, published to the catalog)
Tileset / Asset / Area ──> File   (PNG and thumbnails)
```

- A user can belong to N organizations; an organization can have N users and N spaces.
- A map belongs to exactly one space or exactly one template. It is not a file: it is born blank (or as a copy of a template) and edited inside the system.
- A map is stored as a `layout` (tile layers and zones, in a Tiled-compatible JSON shape) plus one `map_assets` row per placed object. Dimension, `tileSize` and `sizeTier` are properties of the map.
- Tilesets, assets, and areas belong to a library scope: global (`organization_id IS NULL`) or private to an organization. A map can use both.
- `files` is the generic entity behind every upload; it stores metadata, not the binary. The public URL is resolved by the storage layer at use time.
- Space access follows straight from the organization: every active member can enter every space in it. What a member may edit is decided by the edit scope (see [Map Editor](#map-editor)).

All tables use soft delete via `deleted_at`, with uniqueness always scoped to active records.

### Map Editor

The editor is the core of the platform. Everything a space looks like is made with it, from the library of pieces up to the finished map. The full walkthrough is in [docs/map-editor.md](docs/map-editor.md).

**1. Build the library** (`/library`, or `/admin` for the global one)

- **Tilesets**: upload a PNG sheet on a 32 px grid, confirm the grid, and give each tile a category (`FLOOR`, `WALL`, `CEILING`, `DECORATION`, `EMPTY`), an optional solid flag, and a blank-map default. Thin wall styles are built from eight pieces (sides and corners) with collision painted per tile and an overlap that decides how much of a wall draws over an avatar behind it.
- **Assets**: upload a PNG for a placeable object (chair, table, desk, sofa, TV, plant, rug, poster, door, window, tree, decoration). Paint its footprint and collision in the sprite editor, mark seats and their facing, pick the placement (`GROUND`, `SURFACE`, `WALL`), and optionally an action (`SIT`, `TELEPORT`). Colors and rotations are variants of a base asset, and animated assets use a horizontal strip.
- **Bundles**: a root asset can bring parts with it, such as a table with six chairs.
- **Areas**: compose a block of tiles, objects, and an optional zone (an `area` or a private room), up to 16 by 12 tiles, and reuse it as a stamp.

**2. Build maps** (a space's edit page, or `/admin/maps` for templates)

- **Tools**: pan, select, brush, eraser, rectangle, hollow rectangle, bucket fill, picker, and zone.
- **Palette**: Objects, Tiles, and Areas tabs, with the Wall panel to choose a room's wall style.
- **Zones**: `spawn`, `area`, and `private` (a room). A door can only be placed on the wall of a room.
- **Draft, lock, publish**: edits are kept as a local draft. Opening the editor takes a lock on the map (with a heartbeat), so one person edits at a time. Publishing sends the operations to the API, which validates them against the layout rules and the edit scope, then notifies everyone in the space.

**3. Edit scopes**

| Scope                     | Who                                         | What it can change                                       |
| ------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `map` (the Studio)        | The space owner, or the admin on a template | The whole map: tiles, zones, objects                     |
| `objects` (the Decorator) | Members                                     | Only placed objects, such as the items on their own desk |

**4. Templates**

The admin builds complete maps (tiles, zones, and objects) and publishes them as templates (`DRAFT`, `PUBLISHED`, `RETIRED`) with a thumbnail. When creating a space, the owner picks a size tier (`XS` to `XL`) and then either one of the published templates of that size or a blank map.

### From map to rendered world

When a `Space` loads, the app asks the API for the map render payload: the layout, the tilesets it uses, and the placed objects with their sprites, all resolved to file URLs. Phaser builds the scene from it (ground, area floor, walls, furniture, and foreground layers, plus zones and objects), so nothing is hardcoded on the frontend. The same layout can be exported as a standard Tiled JSON on demand (`GET /maps/:mapId/export`), generated from the database and never stored.

### Real-time presence

At scale, the target is 2 to 10 concurrent people per room, small enough for a mesh P2P topology (every peer connected to every peer), with no need for an SFU or dedicated streaming infrastructure. Teammates in the same space see each other move over Socket.IO-signaled WebRTC. The same socket carries the editor lock, the "map published" notices, and the room events (open, lock, join request, crossing a door).

### Proximity voice chat

Each user's avatar carries a proximity radius; when two avatars in the same space come within range, the game scene unlocks a live P2P voice channel between them over the same WebRTC mesh used for presence. Move apart and the channel closes. No SFU, no manual "join call" step. Inside a room, communication is limited to the people in that room.

### Proximity camera and screen sharing

Camera and screen share ride the same mesh as voice, so there is still no media server. What is sent is decided per peer, on every position update: a peer inside the enter radius receives your audio and video, and one beyond the (slightly larger) exit radius stops receiving it, so standing at the edge does not flicker. At most four peers receive your video at once, and the bitrate per receiver shrinks as more of them are watching. Someone out of range receives no media at all, not just a lowered volume.

Because each sender uploads its video once per receiver, this fits the 2 to 10 people target as long as most of them are not clustered in one spot. A large audience for one screen share would need an SFU, which is deliberately not part of this setup. The camera starts off and is opened only when you turn it on.

### Chat (spaces and DMs)

Every space has one standing `SPACE` conversation shared by all of that space's members, for talking without being in proximity range. On top of that, any two members of the same organization can open a `DIRECT` conversation with each other. Both support text and file-attachment messages, editing, reactions, and read receipts, and both are scoped to the organization.

## Storage

Every upload (tileset sheets, asset sprites, thumbnails, chat attachments) goes through a generic `files` entity that only stores metadata (original name, internal file name, extension, MIME type, size) — never the binary itself and never a raw URL. The actual bytes are handled by a pluggable storage driver behind a single `StorageProvider` interface (`upload`/`getUrl`/`delete`), selected instance-wide via `STORAGE_DRIVER` in `.env`:

- **`local` (default)** — files are written to disk on the same server (`public/` by default) and served back through the API. Zero external accounts or credentials needed, so a fresh clone runs end to end without signing up for anything.
- **`s3` (S3-compatible)** — targets any S3-compatible object storage, such as Cloudflare R2, AWS S3, Backblaze B2, or a self-hosted MinIO. The driver contract already exists in `packages/infra/src/integrations/storage`; wiring it up to a real provider is the natural next step for anyone running the app beyond a single small server (e.g. multiple API instances, or wanting uploads off the app server entirely).

Because the client never talks to storage directly — everything is resolved through the API — switching drivers later is a matter of configuration, not a schema or frontend change. If you do switch after already having uploads, moving the underlying files to the new destination (keeping the same internal file name) is a manual, one-time operation.

## Architecture

A `pnpm` + Turborepo monorepo with two deployable apps (`web`, `api`) and shared packages between them:

- `web` is the React SPA that renders both the product UI (dashboard, organizations, spaces) and the game itself (Phaser inside a `<canvas>`, isolated from React's render cycle).
- `api` is the Express HTTP layer: auth, organizations, spaces, maps, the asset library, templates, desks, file upload/storage, and Socket.IO for WebRTC signaling, editor locks, and rooms.
- Contracts, Zod schemas, and domain types shared between `web` and `api` live in `packages/contracts`, so both sides never drift from the same data shape.

```text
.
├── apps/
│   ├── web/                 # Frontend (Vite + React + Phaser)
│   └── api/                 # HTTP backend (Express + TS)
├── packages/
│   ├── contracts/           # Shared Zod schemas, types, errors, and the pure map editor logic (layout rules, ops, stamps, placement)
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

| Layer      | Technologies                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Workspace  | pnpm 11, Turborepo                                                                                     |
| Frontend   | React 19, Vite, TailwindCSS, TanStack Router, TanStack Query, Base UI, Phaser 3, React Hook Form + Zod |
| Backend    | Express 5, TypeScript, JWT, bcrypt, Multer                                                             |
| Database   | PostgreSQL, Drizzle ORM                                                                                |
| Maps       | Built-in editor, Tiled-compatible layout JSON validated via Zod                                        |
| Networking | WebRTC, Socket.IO (signaling, editor locks, rooms)                                                     |
| Quality    | ESLint, Prettier, Vitest, TypeScript                                                                   |

### Key domain entities

| Entity               | Description                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`               | User account; email unique among active records, hashed password                                                                                        |
| `Organization`       | Platform tenant; has an `owner_id` and a unique `slug`                                                                                                  |
| `OrganizationMember` | N:N link between `User` and `Organization`, with `OWNER`/`MEMBER` role                                                                                  |
| `OrganizationInvite` | Pending invite for a user to join an organization                                                                                                       |
| `Space`              | Navigable space; belongs to an `Organization` and owns exactly one `Map`                                                                                |
| `Map`                | The world of a space or template: `layout` (tile layers and zones), dimension, `tileSize`, `sizeTier`, and a `layoutVersion` for optimistic concurrency |
| `MapAsset`           | One object placed on a map: anchor tile, pixel offset, property overrides, and an optional parent (an item on a desk, or a piece of a bundle)           |
| `MapTemplate`        | Catalog entry for a complete map, built by the admin, with a `DRAFT`/`PUBLISHED`/`RETIRED` status and a thumbnail                                       |
| `Tileset`            | A PNG sheet on a 32 px grid with per-tile metadata (category, solid, wall style); global or private to an organization                                  |
| `Asset`              | A placeable object (one PNG) with footprint, collision, placement, action, and optional animation; colors and rotations are variants of a base asset    |
| `AssetPart`          | Bundle link: placing the root asset also places its parts at fixed offsets                                                                              |
| `Area`               | A reusable stamp of tiles, objects, and an optional zone, placed whole by the editor                                                                    |
| `DeskAssignment`     | Links a desk object to the member who claimed it (one person per desk, one desk per person per space)                                                   |
| `File`               | Generic upload entity (tileset, asset sprite, thumbnail, message attachment); stores metadata, not the binary                                           |
| `Conversation`       | Chat thread; `SPACE` (one per space, shared by its members) or `DIRECT` (between two organization members)                                              |
| `Message`            | Text and/or attachment message in a `Conversation`, with edit/delete support                                                                            |

## Getting Started

### Prerequisites

| Requirement    | Version |
| -------------- | ------- |
| Node.js        | 20+     |
| pnpm           | 11+     |
| Docker         | latest  |
| Docker Compose | latest  |

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

`db:seed` creates the development users (`admin@standin.dev`, `owner@standin.dev`, `member@standin.dev`, all with the password `Sup3r$ecret`) and a demo organization, then seeds the global library with a placeholder set of tiles and objects. That placeholder set is what blank maps are built from, so run it before creating a blank space.

To seed your own global library instead, pass a folder containing a `library.json` and the PNGs it points to (the entries carry the same fields as the `data` part of the library upload endpoints):

```bash
pnpm --filter api seed:library path/to/folder
```

The seed is idempotent by key and never deletes anything.

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
pnpm -C packages/database db:seed       # Seed users, demo organization, and the placeholder library
pnpm --filter api seed:library [folder] # Seed the global library, optionally from a folder with library.json
```

## Deployment

Standin is meant to be self-hosted: the only hard requirement is a server (VPS, bare metal, whatever you already run) and a PostgreSQL database — no proprietary platform lock-in.

`web` and `api` are deployed separately: `api` never serves the frontend bundle, it only serves locally-stored uploads under `/public`. After the first migration, run `pnpm -C packages/database db:seed` (or at least `pnpm --filter api seed:library`) so the global library exists; blank maps need it.

1. **Provision PostgreSQL.** Either the bundled `compose.yml` service on the same host, or any managed/self-hosted instance reachable from `api`. Point `DATABASE_URL` at it.
2. **Build both apps** from the repo root: `pnpm install --frozen-lockfile && pnpm build`.
3. **Apply migrations**: `pnpm -C packages/database db:migrate`.
4. **Run the API** (`apps/api/dist/server.js`) as a long-lived Node process behind a process manager (PM2, systemd, Docker — your choice) and a reverse proxy (nginx, Caddy) for TLS. Required env vars: `DATABASE_URL`, `SERVER_PORT`, `SERVER_URL` (the API's own public URL — used to build links to locally-stored files), `JWT_SECRET`, `FRONTEND_URL` (used for CORS), and `STORAGE_DRIVER` (see [Storage](#storage)).
5. **Serve the web build** (`apps/web/dist`, a static bundle) from any static host or the same reverse proxy, with `VITE_BASE_API_URL` pointed at the API's public URL at build time.
6. **Pick a storage strategy**: `local` works out of the box on a single server but ties uploads to that machine's disk; an S3-compatible provider (Cloudflare R2, etc.) is the better fit once you're running more than one API instance or want uploads decoupled from the app server.

7. **(Recommended) Run your own STUN/TURN relay.** Peers behind a strict NAT or a corporate firewall cannot reach each other directly and need a relay, and video makes that traffic noticeable. `compose.yml` ships a `coturn` service behind the `turn` profile: set `TURN_HOST` (your domain or public IP), `TURN_SECRET` (`openssl rand -hex 32`) and optionally `TURN_PORT`/`TURN_TTL_SECONDS` in `.env`, then `docker compose --profile turn up -d coturn`. The API reads the same variables and hands each signed-in user short-lived credentials from `GET /ice-servers`, so there is no fixed username or password. The secret is handed to coturn through a private file inside the container, never on its command line, and the container refuses to start if `TURN_SECRET` is empty. Open `3478` (UDP and TCP) and the relay range `49160-49200/udp` in the host firewall and, on most VPS providers, in the provider's own firewall as well. Without `TURN_HOST` and `TURN_SECRET` the API returns no ICE servers and peers connect only over direct paths, which is enough on a local network.
8. **Use HTTPS.** Browsers only allow microphone, camera and screen capture in a secure context, and the reverse proxy in front of the API must forward WebSocket upgrades for Socket.IO.

None of this requires a paid third-party service — a single small VPS running Postgres, the API process, and the static web build is enough for a small team.

## Maintenance Notes

- Dependencies are saved with exact versions (no `^`), via `saveExact`/`savePrefix` in `pnpm-workspace.yaml`.
- `packages/contracts` is the shared source of truth for schemas/types between `web` and `api`, so any API contract change goes through it first.
