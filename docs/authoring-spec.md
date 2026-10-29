# Authoring spec

A spec is a text file that describes a map, a map template or an area. It names
library items by `key` and never by database id, and it compiles to the same
editor operations the map editor sends, so the result goes through the same
rules as a draft made by hand. The package that does it is `@standin/authoring`.

The same spec on the same starting map always gives the same operations.

## Format

A spec is **YAML**. JSON is accepted too, since JSON is YAML. Every object is
closed: a field the format does not know is an error, not something that is
ignored. Coordinates are in tiles, counted from the top left of the map, and
the anchor of an object is its bottom left cell, as in the editor.

The JSON Schemas of the format are generated from the code and kept in
`packages/authoring/schemas`:

| File                          | Describes                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `spec.schema.json`            | The spec described here                                                           |
| `library.schema.json`         | `library.json`, the seed of a library (see [the map editor guide](map-editor.md)) |
| `library-tileset.schema.json` | `data` of `POST /library/tilesets`                                                |
| `library-asset.schema.json`   | `data` of `POST /library/assets`                                                  |
| `library-variant.schema.json` | `data` of `POST /library/assets/:baseId/variants`                                 |
| `library-area.schema.json`    | `data` of `POST /library/areas`                                                   |

Run `pnpm --filter @standin/authoring generate:schemas` after changing a
schema. A test fails when the committed files are out of date.

### Top level

| Field      | Kind                        | Meaning                                                                 |
| ---------- | --------------------------- | ----------------------------------------------------------------------- |
| `kind`     | all, required               | `map`, `template` or `area`                                             |
| `name`     | all                         | A label for people. Not used by the compiler                            |
| `sizeTier` | `map`, `template`, required | `XS`, `S`, `M`, `L` or `XL`. The map the spec is built on has to fit it |
| `size`     | `area`, required            | `{ width, height }` of the area, 2 to 16 by 2 to 12 tiles               |
| `style`    | all                         | Defaults for rooms: `floor` (`tileset`, `tileIndex`) and `walls`        |
| `floors`   | all                         | Rectangles of floor tiles                                               |
| `rooms`    | all                         | Rooms with walls, a floor and doors                                     |
| `zones`    | all                         | Named regions without walls                                             |
| `desks`    | all                         | Desks, what sits on them and their chairs                               |
| `objects`  | all                         | Single objects                                                          |
| `spawns`   | `map`, `template`           | Spawn points                                                            |

Tilesets have no key: refer to them by **name or id**. Assets are referred to
by their `key`. Walls are a wall `style` named in the tile meta of the tileset
(`{ tileset: brick, style: Brick }`), or one `tileIndex` of the style.

### Rooms

A room has a unique `key`, a `label`, `x`, `y`, `width`, `height` (at least 2
tiles each way), and optionally `walls`, `floor` and `doors`. A room without
`walls` or `floor` takes `style.walls` and `style.floor`. A door has a `side`
(`north`, `east`, `south` or `west`), the `door` key of any variant of the door
family (the variant that fits the side is picked), and an optional `offset`:
the cells from the first cell of the side. Left out, the door is centered.

### Zones, floors and objects

- `zones`: `label`, `x`, `y`, `width`, `height`. A zone has to stand inside the map.
- `floors`: `tileset`, `tileIndex`, `from` and `to` (both corners are painted), and an optional `layer`.
- `objects`: `asset`, `x`, `y`, and optional `offsetX` and `offsetY` in pixels.

### Desks and chairs

A desk has an `asset` (a `DESK`), `x`, `y`, `items` (assets that sit on the
desk, like a monitor) and `chairs` (`CHAIR` assets). A chair is an ordinary
object: it stands where you put it, with the optional pixel offset. Who sits
and which way they face come from the `SIT` action of the chair asset, so the
spec does not set them. Who owns a desk is decided on the server, never in the spec.

### Spawn points

`spawns` are cells with an optional `label`. A **map** has to have one, a
template and an area have none.

## Compiling

```ts
import {
    buildBaseModel,
    compileSpec,
    parseSpec,
    validateSpec,
} from "@standin/authoring";

const parsed = parseSpec(text); // text to a value, syntax only
const valid = parsed.ok ? validateSpec(parsed.value) : parsed; // the schema
const base = buildBaseModel(render, library); // the map to build on
const built = valid.ok ? compileSpec(valid.spec, { base }) : valid;
// built.ok: built.ops are the operations, built.model the result.
// not built.ok: built.issues, each one with a path into the spec.
```

A map or a template is built on the `base` model you give. An area is built
on a blank grid of its own size, so it takes a `library` instead. A spawn point
is asked for on a `map` by default (`requireSpawn: true`), and not on a
`template` or an area. Pass `requireSpawn` to change it.

Steps run in a fixed order: floors, rooms, doors, zones, desks, objects, spawns.
The result is checked as a whole with the same function the server runs on
publish.

## Errors

Every error is `{ code, path, message }`, and the path points into the spec:

| Problem                                        | Code                                | Example path             |
| ---------------------------------------------- | ----------------------------------- | ------------------------ |
| Text that is not YAML                          | `AUTHORING_SPEC_PARSE_ERROR`        |                          |
| Nothing in the spec                            | `AUTHORING_SPEC_EMPTY`              |                          |
| A field the format does not have               | `AUTHORING_SPEC_UNKNOWN_FIELD`      | `rooms[0].colour`        |
| A value of the wrong type                      | `AUTHORING_SPEC_INVALID_TYPE`       | `rooms`                  |
| A value that is not one of the choices         | `AUTHORING_SPEC_INVALID_VALUE`      | `rooms[1].doors[0].side` |
| A number out of range                          | `AUTHORING_SPEC_OUT_OF_RANGE`       | `objects[0].x`           |
| A room key used twice                          | `AUTHORING_SPEC_DUPLICATE_ROOM_KEY` | `rooms[1].key`           |
| An asset or tileset that is not in the library | `AUTHORING_UNKNOWN_KEY`             | `objects[1].asset`       |
| An asset key that more than one row has        | `AUTHORING_DUPLICATE_KEY`           | `desks[0].asset`         |
| A map that does not fit the tier               | `AUTHORING_SPEC_SIZE_TIER_MISMATCH` | `sizeTier`               |
| A map with no spawn                            | `SPAWN_MISSING`                     | `spawns`                 |

The rules of the editor (an object over another, a door outside a room, a room
outside the map) keep their own codes and point at the step that broke them.

## Examples

The examples below are files in `packages/authoring/examples`. The tests parse
and compile every one of them against a test library with the keys `crate`,
`desk`, `chair`, `monitor`, `door-n`, `door-e`, `door-s`, `door-w` and the
tilesets `floor`, `brick` and `broken`. In a real library, use your own keys.

### A map: rooms, doors, desks and objects

`office.yaml`

<!-- prettier-ignore -->
```yaml
kind: map
name: Office
sizeTier: S
style:
  floor: { tileset: floor, tileIndex: 0 }
  walls: { tileset: brick, style: Brick }
floors:
  - { tileset: floor, tileIndex: 1, from: { x: 0, y: 13 }, to: { x: 29, y: 14 } }
rooms:
  - key: office
    label: Office
    x: 4
    y: 4
    width: 10
    height: 8
    doors:
      - { side: south, door: door-s }
  - key: meeting
    label: Meeting room
    x: 16
    y: 4
    width: 8
    height: 6
    doors:
      - { side: west, door: door-w, offset: 2 }
zones:
  - { label: Lounge, x: 4, y: 15, width: 6, height: 4 }
desks:
  - asset: desk
    x: 6
    y: 7
    items:
      - { asset: monitor, x: 6, y: 7 }
    chairs:
      - { asset: chair, x: 6, y: 8 }
  - asset: desk
    x: 9
    y: 7
    chairs:
      - { asset: chair, x: 9, y: 8, offsetY: 4 }
objects:
  - { asset: crate, x: 11, y: 6 }
  - { asset: crate, x: 20, y: 8 }
spawns:
  - { x: 8, y: 16, label: Entrance }
```

### The same thing in JSON

`office.json`

<!-- prettier-ignore -->
```json
{
    "kind": "map",
    "sizeTier": "S",
    "rooms": [
        {
            "key": "office",
            "label": "Office",
            "x": 4,
            "y": 4,
            "width": 10,
            "height": 8,
            "walls": { "tileset": "brick", "style": "Brick" },
            "floor": { "tileset": "floor", "tileIndex": 0 },
            "doors": [{ "side": "south", "door": "door-s" }]
        }
    ],
    "objects": [{ "asset": "crate", "x": 11, "y": 6 }],
    "spawns": [{ "x": 8, "y": 14 }]
}
```

### A template

`template.yaml`

<!-- prettier-ignore -->
```yaml
# A template has no spawn point, so none is asked for.
kind: template
name: Open plan
sizeTier: S
style:
  walls: { tileset: brick, style: Brick }
rooms:
  - key: quiet
    label: Quiet room
    x: 2
    y: 2
    width: 6
    height: 5
    doors:
      - { side: east, door: door-e }
desks:
  - asset: desk
    x: 12
    y: 8
    chairs:
      - { asset: chair, x: 12, y: 9 }
```

### An area

`area.yaml`

<!-- prettier-ignore -->
```yaml
# An area is built on a blank grid of its own size.
kind: area
name: Work corner
size: { width: 8, height: 6 }
floors:
  - { tileset: floor, tileIndex: 0, from: { x: 0, y: 0 }, to: { x: 7, y: 5 } }
desks:
  - asset: desk
    x: 2
    y: 3
    items:
      - { asset: monitor, x: 2, y: 3 }
    chairs:
      - { asset: chair, x: 2, y: 4 }
objects:
  - { asset: crate, x: 6, y: 1 }
```
