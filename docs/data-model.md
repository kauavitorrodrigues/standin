# Data model guide

How the data of the platform is organized: who owns what, how a map is stored,
and what each entity is. This page is for people who maintain the platform.

## Data hierarchy

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
- Space access follows straight from the organization: every active member can enter every space in it. What a member may edit is decided by the edit scope (see [map editor guide](map-editor.md)).

All tables use soft delete via `deleted_at`, with uniqueness always scoped to active records.

## From map to rendered world

When a `Space` loads, the app asks the API for the map render payload: the layout, the tilesets it uses, and the placed objects with their sprites, all resolved to file URLs. Phaser builds the scene from it (ground, area floor, walls, furniture, and foreground layers, plus zones and objects), so nothing is hardcoded on the frontend. The same layout can be exported as a standard Tiled JSON on demand (`GET /maps/:mapId/export`), generated from the database and never stored.

## Key domain entities

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
