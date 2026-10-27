<div align="center">
	<img src="assets/logo.png" alt="Stand!N logo" width="220" />

<br>

<br>

![Repository](https://img.shields.io/badge/repository-public-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![Node](https://img.shields.io/badge/node-%3E%3D20-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![pnpm](https://img.shields.io/badge/pnpm-11%2B-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)
![TypeScript](https://img.shields.io/badge/typescript-6.x-101418?style=for-the-badge&labelColor=101418&color=FFFFFF)

A 2D top-down virtual space for teams, with a built-in map editor, real-time presence, text/attachment chat, proximity voice, and proximity camera and screen sharing.

[Overview](#overview) • [Features](#features) • [Documentation](#documentation) • [How It Works](#how-it-works) • [Map Editor](#map-editor) • [Architecture](#architecture) • [Storage](#storage) • [Getting Started](#getting-started) • [Sign in with GitHub](#sign-in-with-github) • [Scripts](#scripts) • [Deployment](#deployment)

</div>

## Overview

Stand!N is a 2D top-down virtual space platform for teams, inspired by tools like Gather and classic Habbo Hotel. Each `Organization` is the platform's tenant: it owns its members, its spaces (`Space`), and the maps (`Map`) those spaces render in Phaser.

The product goal is to give a team a navigable "virtual office" with real-time presence between teammates, and to let them build that office themselves. There is no external map tool: the platform ships a complete map editor. You upload your own art (tileset sheets and object sprites), and then assemble tilesets, objects, areas, rooms, and whole maps inside the app. It has no dependency on paid third-party services beyond the server it runs on.

## Features

- **Multi-tenant organizations**: each `Organization` isolates its own members (`organization_members`, `OWNER`/`MEMBER` roles) and spaces.
- **Spaces (`Space`)**: a space belongs to exactly one organization and owns exactly one `Map`. The map is created together with the space, either blank (by size tier) or copied from a published template.
- **Built-in map editor**: tile painting, objects, areas, rooms with doors, zones, undo/redo, and a draft-then-publish flow, all inside the platform (see [Map Editor](#map-editor)).
- **Asset library**: upload your own PNGs as tilesets or placeable objects, with footprint and collision painted in the browser. The library is global (managed by the instance admin) or private to an organization (managed by its owner).
- **Reusable areas**: capture a block of tiles, objects, and an optional zone as an area, and stamp it onto any map.
- **Rooms and doors**: a room is a private zone with walls and doors. Doors can be locked, and people outside ask to join. Communication is limited to the people in the same room.
- **Custom avatars**: each person builds an avatar from parts (skin, hair, clothes, accessories) in an editor, and everyone in the space sees it change live. Whoever has none is a ghost. The full guide is in [docs/avatar.md](docs/avatar.md).
- **Profile picture**: each person can upload a photo (cropped and shrunk on the server) that shows in lists, the chat and the name tag, and updates live for everyone in the space. It is separate from the avatar. See [docs/profile-picture.md](docs/profile-picture.md).
- **Sign in with GitHub (optional)**: an instance can offer a "Entrar com GitHub" button next to the e-mail and password form. It is off until the instance owner creates a GitHub App and fills three variables in `.env`. See [Sign in with GitHub](#sign-in-with-github) and [docs/github-login.md](docs/github-login.md).
- **Desks and seats**: members claim a desk, and avatars sit on seats. Each member can decorate the items on their own desk.
- **Map templates**: the admin builds complete maps and publishes them as templates, which organization owners pick from when creating a space.
- **Abstracted file storage**: a generic `files` entity behind a pluggable storage driver, so the instance operator picks where uploads actually live (see [Storage](#storage) below).
- **Self-hostable**: no mandatory third-party service. Run your own instance with just a server and a PostgreSQL database (see [Deployment](#deployment) below).
- **Phaser game engine**: the space is rendered full-screen via Phaser 3, with the product UI (toolbar, sidebar) overlaid on top of the canvas.
- **Own auth**: password-based sign-up/login (bcrypt) and JWT, with no external provider dependency.
- **Chat messaging**: text and attachment messages, in two conversation shapes: a `DIRECT` conversation between members, or a `SPACE` conversation shared by every member of that space (both scoped to the organization).
- **Room for a lot of people**: a space holds many people at once, depending on the server. See the [performance guide](docs/performance.md).
- **Proximity voice chat**: voice through a media server (an SFU) that runs inside the API, forwarded automatically between users when their avatars get close enough inside a space, so a space can hold dozens of people on microphone.
- **Proximity camera and screen sharing**: the same rule as voice, applied to video. The server picks the few videos each person sees (a shared screen first), and videos render centered over the map.

## Documentation

Longer guides live in [`docs/`](docs). Each one is for the people who use or maintain that part of the platform.

| Guide                                           | What it covers                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------- |
| [Map editor](docs/map-editor.md)                | Building the library, maps, rooms and templates, and the edit scopes  |
| [Avatar](docs/avatar.md)                        | How people build their avatar and how admins manage the parts library |
| [Profile picture](docs/profile-picture.md)      | The photo shown in lists, chat and the name tag                       |
| [Sign in with GitHub](docs/github-login.md)     | Turning on the optional GitHub login for an instance                  |
| [Real-time and media](docs/realtime.md)         | Presence, proximity voice, camera and screen sharing, and chat        |
| [Data model](docs/data-model.md)                | Who owns what, how a map is stored, and the entities                  |
| [Architecture](docs/architecture.md)            | The repository layout, the stack and how the pieces fit               |
| [Storage](docs/storage.md)                      | Where uploads live and how to change it                               |
| [Deployment](docs/deployment.md)                | Running an instance on your own server                                |
| [Performance and capacity](docs/performance.md) | How the real-time side scales, its limits, and how to size a server   |

## How It Works

### Data hierarchy

An `Organization` is the tenant. It has members, and it owns spaces and a private library of tilesets, assets and areas. A `Space` owns exactly one `Map`, and a map is stored as a layout plus one row per placed object. Every table uses soft delete. The full diagram, the rules and the entities are in the [data model guide](docs/data-model.md).

### Map Editor

The editor is the core of the platform. Everything a space looks like is made with it, from the library of pieces (tilesets, assets, bundles, areas) up to the finished map, with rooms and doors, a draft-then-publish flow and two edit scopes. The full walkthrough is in the [map editor guide](docs/map-editor.md).

### From map to rendered world

When a space loads, the app asks the API for a render payload (layout, tilesets and placed objects, all resolved to file URLs) and Phaser builds the scene from it. See the [data model guide](docs/data-model.md#from-map-to-rendered-world).

### Real-time, voice, video and chat

People in the same space see each other move, emote and talk in real time over Socket.IO. Voice, camera and screen sharing go through the media server and follow proximity, and chat has a conversation for each space plus direct conversations. The details are in the [real-time and media guide](docs/realtime.md).

## Storage

Every upload goes through a generic `files` entity and a pluggable storage driver, chosen by `STORAGE_DRIVER` in `.env`. `local` (the default) needs no external account, and an S3-compatible driver is planned. See the [storage guide](docs/storage.md).

## Architecture

A `pnpm` + Turborepo monorepo with two apps, `web` (React and Phaser) and `api` (Express and Socket.IO), and shared packages: `contracts`, `core`, `database`, `infra` and the shared configs. The layout, the stack and how the pieces fit are in the [architecture guide](docs/architecture.md).

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

# Connections the API may hold open to Postgres. Defaults to 20.
DATABASE_POOL_MAX=20
# Set to 1 to log the queries sent to Postgres per join and per second. Off by default.
DB_QUERY_COUNT=0

# defaults to "local" if omitted
STORAGE_DRIVER=local

# optional: sign in with GitHub, on only when all three are set
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL=""

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

## Sign in with GitHub

Optional and off by default. Create a GitHub App for the instance, set `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `GITHUB_CALLBACK_URL` in `.env`, and restart the API. The steps are in the [GitHub login guide](docs/github-login.md).

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

### API scripts

```bash
pnpm --filter api backfill:avatar-sheets                                         # Assemble again the avatar sheets that are out of date, once after a deploy
```

## Deployment

Standin is meant to be self-hosted: a server and a PostgreSQL database are the only hard requirements, with no proprietary platform lock-in. `web` and `api` are deployed separately, and the steps (build, migrations, the API process, the static web build, the media port, storage and HTTPS) are in the [deployment guide](docs/deployment.md).

## Maintenance Notes

- Dependencies are saved with exact versions (no `^`), via `saveExact`/`savePrefix` in `pnpm-workspace.yaml`.
- `packages/contracts` is the shared source of truth for schemas/types between `web` and `api`, so any API contract change goes through it first.
