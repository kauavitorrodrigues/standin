# Architecture guide

The layout of the repository, the stack, and how the apps and packages fit
together.

A `pnpm` + Turborepo monorepo with two deployable apps (`web`, `api`) and shared packages between them:

- `web` is the React SPA that renders both the product UI (dashboard, organizations, spaces) and the game itself (Phaser inside a `<canvas>`, isolated from React's render cycle).
- `api` is the Express HTTP layer: auth, organizations, spaces, maps, the asset library, templates, desks, file upload/storage, and Socket.IO for presence and position, chat events, media signalling, editor locks, and rooms. The media server (`packages/media`, a mediasoup worker) runs inside the API process.
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
│   ├── media/               # The media server (mediasoup) and the pure subscription planner
│   ├── infra/                # Technical integrations (storage, etc.)
│   └── config/
│       ├── tsconfig/         # TS presets
│       ├── eslint/            # Shared ESLint preset
│       ├── prettier/          # Shared Prettier preset
│       └── vitest/             # Vitest presets
├── compose.yml                 # Local infra (PostgreSQL) and, with the `app` profile, the deployment
├── Dockerfile                   # The API image and the web proxy image
├── deploy/                      # Caddyfile, container entrypoint and backup script
├── package.json                # Root scripts and devDependencies
├── pnpm-workspace.yaml          # Workspace declarations
├── turbo.json                   # Turborepo pipeline config
├── prettier.config.cjs          # Root Prettier config
└── .env / .env.example
```

### Stack

| Layer      | Technologies                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Workspace  | pnpm 11, Turborepo                                                                                                  |
| Frontend   | React 19, Vite, TailwindCSS, TanStack Router, TanStack Query, Base UI, Phaser 3, React Hook Form + Zod              |
| Backend    | Express 5, TypeScript, JWT, bcrypt, Multer                                                                          |
| Database   | PostgreSQL, Drizzle ORM                                                                                             |
| Maps       | Built-in editor, Tiled-compatible layout JSON validated via Zod                                                     |
| Networking | Socket.IO (presence, position, chat events, editor locks, rooms), WebRTC through a media server for audio and video |
| Quality    | ESLint, Prettier, Vitest, TypeScript                                                                                |
