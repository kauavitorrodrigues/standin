# Map editor guide

Stand!N has a complete map editor built into the platform. You do not need any
external tool: you upload your own art, and everything else (tilesets, objects,
areas, rooms, whole maps) is assembled in the browser.

The work goes in three layers, each one feeding the next:

1. **Library**: the pieces (tilesets, assets, areas).
2. **Map**: the world made from those pieces, in a space or a template.
3. **Space**: a map that people walk around in.

## Who can do what

| Role                         | Library                                                                | Maps                                                                   |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Admin (`ADMIN`)              | Builds the **global** library, shared by every organization (`/admin`) | Builds and publishes **templates** (`/admin/maps`)                     |
| Organization owner (`OWNER`) | Builds the **private** library of the organization (`/library`)        | Edits the whole map of its spaces (the Studio)                         |
| Member (`MEMBER`)            | Reads                                                                  | Decorates objects (the Decorator), such as the items on their own desk |

A map can use pieces from the global library and from the private library of
its organization at the same time.

## 1. The library

Open `/library` (or `/admin` for the global one). It has three sections.

### Tilesets

A tileset is a PNG sheet cut in a 32 px grid, used to paint floors, walls, and
decoration on the map.

- The image must be a PNG of at most 3 MB and 4096 px per side.
- After uploading, confirm the grid (tile size, margin, spacing). The editor
  warns when the image does not fit the grid.
- Give each tile a **category**: `FLOOR`, `WALL`, `CEILING`, `DECORATION`, or
  `EMPTY` (a transparent tile that is never painted). A tileset is "complete"
  when all of its tiles have a category.
- Mark a tile as **solid** when avatars cannot walk through it.
- Mark one `FLOOR` and one `WALL` tile as the **blank default**. Blank maps
  are generated from them.

#### Thin wall styles

Thin walls are built from a **wall style**, a set of eight pieces drawn from a
room outline seen from above: four sides (`n`, `e`, `s`, `w`) and four corners
(`ne`, `se`, `sw`, `nw`). In the tileset editor you:

- pick the piece files, or split a strip into the eight pieces,
- preview them on a small room,
- paint the **collision** of each piece on a 4 by 4 grid per tile, so a thin
  wall only blocks the cells it actually occupies,
- set the **overlap**, the number of rows (0 to 32) of a piece that draw over
  an avatar standing behind it, or choose a tile to draw on top of it.

A style is complete when it has the eight pieces. Walls are autotiled when
you paint and erase them.

### Assets

An asset is a placeable object: one PNG that becomes a piece of furniture, a
plant, a door, and so on.

- **Type**: `CHAIR`, `TABLE`, `DESK`, `SOFA`, `TV`, `MONITOR`, `TREE`, `PLANT`,
  `RUG`, `POSTER`, `DOOR`, `WINDOW`, or `DECORATION`.
- **Category**: the palette tab it shows up in (Sitting, Tables, Shelves,
  Machines, Food and drink, Room decor, Wall decor, Outdoor). It only organizes the palette.
- **Sprite size**: a multiple of 32 px, read from the PNG.
- **Footprint**: which tiles the object occupies, painted by cells in the
  sprite editor. It is separate from the sprite, so a tall object can occupy
  one tile.
- **Collision**: which parts of the footprint block movement, painted on a 4 by
  4 grid per tile. Rugs and other flat pieces stay walkable.
- **Placement**: `GROUND`, `SURFACE` (sits on a `TABLE` or `DESK`), or `WALL`.
- **Action**: optional. `SIT` makes it a seat (you mark the facing), `TELEPORT`
  makes it a portal. An asset with no action is decoration.
- **Animation**: upload a horizontal strip of frames and set the playback.
- **Variants**: colors and rotations are other rows of the same family. A door
  needs a rotation per wall side so it fits the wall it stands in.
- **Bundles**: a root asset can bring parts, such as a table with six chairs.
  Placing the root places every part at its offset.

Assets of type `RUG` are drawn below every avatar. Everything else is sorted
by its position so avatars walk in front of and behind objects correctly.

### Areas

An area is a reusable block: tiles, objects, and an optional zone, composed in
its own editor (up to 16 by 12 tiles and 150 objects). Placing it on a map
stamps the whole block at once, and the floor it covers comes back if the area
is removed. An area can carry a zone, either a named `area` or a private
**room**.

## 2. Building a map

A map is edited in two places:

- **A space**: its edit page, for the organization owner.
- **A template**: `/admin/maps`, for the admin.

### Creating one

- **Space**: choose a size tier, then either a published template of that
  size or **Blank**. The map is copied from the template or
  generated from the default floor and wall of the library.
- **Template**: the admin creates it, edits it, uploads a thumbnail, and
  publishes it. A template has a status: `DRAFT`, `PUBLISHED`, or `RETIRED`.
  Only published templates show up when creating a space.

| Tier | People    | Max size (tiles) |
| ---- | --------- | ---------------- |
| `XS` | 2 to 6    | 24 by 16         |
| `S`  | 7 to 10   | 30 by 20         |
| `M`  | 11 to 25  | 48 by 32         |
| `L`  | 26 to 50  | 64 by 48         |
| `XL` | 51 to 150 | 100 by 100       |

Tiers whose smallest group does not fit the 10 person P2P mesh are not
enabled yet.

### Tools

| Tool             | Key | What it does                                       |
| ---------------- | --- | -------------------------------------------------- |
| Pan              | `M` | Drag to move the map (also middle button or space) |
| Select           | `V` | Select an object or a zone                         |
| Brush            | `P` | Paint one tile at a time                           |
| Eraser           | `E` | Erase tiles                                        |
| Rectangle        | `R` | Fill an area with the chosen tile                  |
| Hollow rectangle | `B` | Paint only the border of an area                   |
| Bucket           | `G` | Flood fill                                         |
| Picker           | `I` | Pick the tile under the cursor                     |
| Zones            | `Z` | Draw a zone (spawn, area, room)                    |

Zoom goes from 1x to 3x. The history keeps the last 200 steps, and undo and
redo work across tiles, zones, and objects.

### The palette

- **Objects**: the assets of the library, by category, with search. Hover shows
  a ghost of the footprint, red when the spot is not valid.
- **Tiles**: the tilesets of the library, filtered by category. The **Wall**
  panel picks the wall style of a room.
- **Areas**: the areas of the library, placed as a stamp.

### Layers and zones

The layout is stored in a Tiled-compatible shape with these layers, from back
to front: `ground`, `area-floor`, `walls`, `furniture`, `foreground`, and a
`zones` group. Zone kinds:

| Kind      | Role                                           |
| --------- | ---------------------------------------------- |
| `spawn`   | Where avatars appear when they enter           |
| `area`    | A named region                                 |
| `private` | A **room**: walls, doors, and a lockable entry |

Limits: 100 tiles per side, 8 tilesets, 200 zones, and 3000 objects per map.

### Rooms and doors

Draw a **Room** (private zone) with the zone tool, or place an area that is a
room. The room gets walls from the chosen wall style, and **doors** can only be
placed on the wall of a room, where they snap to a gap and pick the variant
that fits the wall side. Publishing is refused when a door is outside a room.

At play time a room can be open, closed, or locked. Someone inside can lock
it, people outside ask to join, and communication (voice and video) is limited
to the people in the same room.

### Desks and seats

A `DESK` asset can be claimed by one member, and a member holds one desk per
space. A `SIT` asset seats one avatar at a time. Members can place and move
items on top of their own desk without opening the Studio.

### Draft, lock, and publish

- Edits are kept as a **local draft**, one per edit mode, so closing the tab
  does not lose work.
- Opening an edit session takes a **lock** on the map, renewed by a heartbeat
  every 15 s and released after 45 s without one. Only one person edits at a
  time, and the Studio takes priority over the Decorator: the decorator's
  draft is kept and resumed afterwards.
- **Publish** sends the operations to the API. It validates them against the
  layout rules and the edit scope, rejects a stale revision, applies them in
  one go, and tells everyone in the space that the map changed.

### Edit scopes

| Scope     | Where     | Can change                |
| --------- | --------- | ------------------------- |
| `map`     | Studio    | Tiles, zones, and objects |
| `objects` | Decorator | Placed objects only       |

## 3. Seeding a library from files

For a fresh instance you can load a library from disk instead of uploading
piece by piece. Create a folder with a `library.json` and the PNGs it points
to, then run:

```bash
pnpm --filter api seed:library path/to/folder
```

Each entry carries the same fields as the `data` part of the upload endpoints
(`POST /library/tilesets`, `POST /library/assets`, variants, avatar parts and
bases, areas), plus a `file` path relative to the folder. The seed runs the
same services as the endpoints, so it applies the same validation. It is
idempotent by `key` and never deletes. A field an entry leaves out is not
compared, so a seed does not undo an edit made in the editor. Without a
folder, it loads the placeholder library that blank maps are built from.

Every section is optional. A file with only `tilesets` and `assets` works as
it always did.

### Order

The sections are applied in this order, since each one names what the earlier
ones made:

1. `tilesets`
2. `assets` (with their `variants`)
3. `bundles`, the parts of assets, once every asset exists
4. `areas`, which name tilesets and assets by `key`
5. `avatarBases`
6. `avatarParts` (with their color `variations`)

A second run prints `unchanged` for every entry whose fields and PNGs did not
change. An entry that a service refuses stops the run with the section, the
`key` and the reason, for example `avatarParts "hair-red": The avatar sheet
does not have the expected size.`

### Bundles

A bundle sets the parts of an asset: placing the root also places its parts.
Root and parts are assets by `key`, from the file or already in the library.
A bundle that lists no parts clears them. The parts of a root that a map
already uses cannot change, like in the editor.

### Areas

An area is a stamp and its thumbnail, a PNG of the stamp size times 32 px (64x64 for a 2x2 stamp). The
stamp is the one the editor stores, except that tilesets and assets are named
by `key` (`tilesetKey` in the palette, `assetKey` in the objects). The seed
turns the keys into ids before the stamp is validated. A key that matches
nothing fails the entry and lists the field of each one. The `key` of the area
is its identity, and it is stored in the database. Areas made in the editor
have no key.

### Avatars

Avatar parts and bases are identified by `key`. The `slot` of a part is its
category: the categories exist already, one for each slot. The sprite sheet
(`file`) must be 2304x64 with 72 frames and the `preview` any PNG. A color
variation is found by its `colorKey` inside the part, and its own key is
derived from the key of the part and the color, like in the endpoint. The
`slot` of a part and the `kind` of a base never change.

### Example

```json
{
    "tilesets": [
        {
            "key": "floor",
            "name": "Floor",
            "file": "floor.png",
            "tileMeta": { "0": { "category": "FLOOR" } }
        }
    ],
    "assets": [
        {
            "key": "chair",
            "name": "Chair",
            "type": "CHAIR",
            "footprint": { "w": 1, "h": 1 },
            "file": "chair.png"
        },
        {
            "key": "table",
            "name": "Table",
            "type": "TABLE",
            "footprint": { "w": 1, "h": 1 },
            "file": "table.png"
        }
    ],
    "bundles": [
        {
            "asset": "table",
            "parts": [{ "partAsset": "chair", "offsetX": 0, "offsetY": 1 }]
        }
    ],
    "areas": [
        {
            "key": "lobby",
            "name": "Lobby",
            "file": "lobby.png",
            "stamp": {
                "version": 1,
                "width": 2,
                "height": 2,
                "palette": [{ "tilesetKey": "floor", "tileIndex": 0 }],
                "layers": { "ground": [1, 1, 1, 1] },
                "objects": [
                    {
                        "assetKey": "table",
                        "dx": 0,
                        "dy": 0,
                        "offsetX": 0,
                        "offsetY": 0,
                        "parentIndex": null
                    }
                ],
                "zone": null
            }
        }
    ],
    "avatarBases": [
        { "key": "body", "name": "Body", "file": "body.png", "isDefault": true }
    ],
    "avatarParts": [
        {
            "key": "hair-short",
            "name": "Short hair",
            "slot": "HAIR",
            "colorKey": "black",
            "colorHex": "#1A1A1A",
            "file": "hair-short.png",
            "preview": "hair-short-preview.png",
            "variations": [
                {
                    "colorKey": "red",
                    "colorHex": "#B03A2E",
                    "file": "hair-short-red.png",
                    "preview": "hair-short-red-preview.png"
                }
            ]
        }
    ]
}
```

The JSON Schema of the file is `packages/authoring/schemas/library.schema.json`.

## 4. Exporting

Any map can be exported as a standard Tiled JSON with
`GET /maps/:mapId/export`. It is generated from the database on demand and is
meant for inspection and backup, not as an authoring format: maps are edited in
Stand!N, not imported back.
