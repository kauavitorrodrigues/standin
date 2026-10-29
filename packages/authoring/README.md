# @standin/authoring

Builds and checks map operations without the editor. The builders take the current `EditorModel` and answer `EditorOp[]`; `validateOps` replays them with the same function the server runs on publish.

It only composes what `@standin/contracts` already has (`replayOps`, `buildRoomWallOps`, `findDoorSlots`, `buildStampOps`, `validateEditorOps`...). It is **pure**: no I/O, no database, no clock, no randomness, and it depends on `@standin/contracts`, `zod` and `yaml` only, so it runs in the CLI, in tests and in the browser. Fetching a map or sending ops is up to the caller. The same input always gives the same ops, and the ids of new objects are `authoring-1`, `authoring-2`... unless you pass `newTempId`.

## What it has

| Function                                             | What it does                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `createRoom`                                         | Optional floor, wall outline of a style, and the private zone with its key                   |
| `placeDoor`                                          | Opens a gap in the wall of a room and places the door variant that fits the side             |
| `createZone`                                         | A named region with no walls, checked to stand inside the map                                |
| `placeObject`                                        | One `place_asset` by asset key                                                               |
| `placeDesk`                                          | A DESK asset, what sits on it (with the desk as parent) and chairs                           |
| `setSpawn`                                           | A spawn zone of one tile                                                                     |
| `paintFloor`                                         | A rectangle of tiles, split in blocks of `MAX_CELLS_PER_OP`                                  |
| `stampArea`                                          | Places a `Stamp` you already have                                                            |
| `composeOps(model, steps, options?)`                 | Runs steps one after the other, each on the result of the last, and checks the whole draft   |
| `validateOps(base, ops, options?)`                   | The dry run. Same answer as `validateEditorOps` (`requireSpawn` adds the one-spawn rule)     |
| `buildBaseModel(render, library)`                    | The starting model from a map render and a palette                                           |
| `createLibraryIndex(library)`                        | Resolves asset keys and tileset ids or names, with structured errors for unknown or repeated |
| `createRectMask`, `createFootprintMasks`             | Footprint and solid masks from rectangles, in the format the asset schema asks for           |
| `parseSpec(text)`                                    | Reads YAML or JSON text of a spec to a value (syntax only)                                   |
| `validateSpec(value)`                                | Checks the value with the zod schema; issues carry a path into the spec                      |
| `compileSpec(spec, { base, library, requireSpawn })` | Compiles a spec to ops with the builders; issues point into the spec                         |
| `buildJsonSchemas()`                                 | The JSON Schemas of the spec, `library.json` and the library create payloads                 |

Every builder answers `{ ok: true, ops }` or `{ ok: false, issues }`, where an issue is `{ code, path, message, opIndex? }`. The builders replay their ops on the model, so an `ok` result is accepted by the shared rules.

Two things the palette does not give: a tileset has no key, so tilesets are found by id or by name, and a wall style is named in the tile meta of the tileset.

## Example

A room with a door, a desk with a monitor and a chair, a crate and a spawn, checked as one draft:

```ts
import {
    buildBaseModel,
    composeOps,
    createRoom,
    placeDesk,
    placeDoor,
    placeObject,
    setSpawn,
    validateOps,
} from "@standin/authoring";

const base = buildBaseModel(render, library); // render from the map, library from the palette

const built = composeOps(
    base,
    [
        (model) =>
            createRoom(model, {
                key: "office",
                label: "Office",
                x: 4,
                y: 4,
                width: 10,
                height: 8,
                walls: { tileset: "brick", style: "Brick" },
                floor: { tileset: "floor", tileIndex: 0 },
            }),
        (model) =>
            placeDoor(model, { room: "office", side: "south", door: "door-s" }),
        (model) =>
            placeDesk(model, {
                desk: "desk",
                tileX: 6,
                tileY: 7,
                items: [{ asset: "monitor", tileX: 6, tileY: 7 }],
                chairs: [{ asset: "chair", tileX: 6, tileY: 8 }],
            }),
        (model) => placeObject(model, { asset: "crate", tileX: 11, tileY: 6 }),
        (model) => setSpawn(model, { tileX: 8, tileY: 9 }),
    ],
    { requireSpawn: true }
);

if (!built.ok) {
    // built.stepIndex is the step that failed, built.issues says why.
    throw new Error(JSON.stringify(built.issues));
}

// The ops to send. Checking them again alone gives the same answer.
const checked = validateOps(base, built.ops, { requireSpawn: true });
```

Doors are checked on the whole draft, not step by step: a door must end up on the border of exactly one private zone, and the issue points at the last op, like the server does.

## Specs

A spec is a YAML (or JSON) file that describes a map, a template or an area with library keys, and compiles to the ops of the builders. The format, the errors and worked examples are in [docs/authoring-spec.md](../../docs/authoring-spec.md); the files the examples come from are in `examples/`.

```ts
const parsed = parseSpec(text);
const valid = parsed.ok ? validateSpec(parsed.value) : parsed;
const built = valid.ok ? compileSpec(valid.spec, { base }) : valid;
```

`requireSpawn` is on by default for a `map` spec, and off for a `template` and an `area`.

## JSON Schemas

`schemas/` holds the JSON Schemas of the spec, of `library.json` and of the library create payloads. They are generated from the zod schemas, never edited by hand:

```bash
pnpm --filter @standin/authoring generate:schemas
```

A test builds them again and fails when a committed file differs, so a change to a schema has to come with the new files.
