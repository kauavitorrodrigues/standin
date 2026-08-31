# How to build a tilemap for Standin

Guide for whoever is building the map in [Tiled](https://www.mapeditor.org/)
and exporting the `.json` to upload into the system. Uploading a map
requires a Tiled JSON plus one image per tileset used; the backend
validates all of it before accepting the map. This document explains the
rules so the map passes validation on the first try.

## General structure

The map exported from Tiled has `layers` and `tilesets`. Only two things in
this JSON matter to the system:

1. **`tilesets`**: each entry needs a `name`. That name must match the
   filename of the image you upload alongside it (without the extension).
   Example: tileset `"interior"` matches file `interior.png`.
2. **`layers`**: only two layer types are processed:

| `layer.type`  | Role                                                            |
| ------------- | ---------------------------------------------------------------- |
| `tilelayer`   | Visual, rendered as is, no property is read                      |
| `objectgroup` | Data source, every object inside it is validated (see below)     |

The layer's **name** (`layer.name`) is just for your own organization, it
does not affect game behavior. Layers of any other type (`imagelayer`,
`group`, etc.) are ignored.

Use as many `tilelayer` as you want to build the visuals (floor, walls,
overlay decoration). Use one or more `objectgroup` to place collision and
interaction objects.

## Objects inside an `objectgroup`

Every object you draw on an object layer is a rectangle with `id`, `name`,
`type`, position/size, and a list of `properties` (added in Tiled's custom
properties panel, the `+` button).

Fields required on every object:

| Field           | Type   | Note                                                                    |
| --------------- | ------ | ------------------------------------------------------------------------ |
| `id`            | number | Generated automatically by Tiled                                        |
| `name`          | string | Used in error messages, give it a descriptive name                      |
| `type`          | string | Free category (e.g. `chair`, `wall`, `door`), purely descriptive, has no effect on logic |
| `x, y`          | number | Position                                                                 |
| `width, height` | number | Size                                                                     |

`gid` is optional. It only exists if the object is a **Tile Object**
(dragged from the tileset instead of drawn as an empty rectangle). In that
case it gets its own sprite in the game. Use this only when the object
needs individual depth sorting (e.g. a tall cabinet). For most cases (a
top down table, a rug), resolve it with just the visual tile layer plus a
separate collision rectangle without `gid`.

## Properties of each object

The object's `properties` (Tiled's `{ name, type, value }` array) are
normalized by the system into a single object (`{ solid: ..., interactable:
... }`). Two base properties, always optional:

| Property       | Tiled type | Default | Effect                                |
| -------------- | ---------- | ------- | -------------------------------------- |
| `solid`        | `bool`     | `false` | Becomes a physics body, blocks movement |
| `interactable` | `bool`     | `false` | Becomes an interaction zone            |

**Purely decorative or collision only object:** no other property is
needed. If `interactable` is `false` or absent, no `action` field is read,
you can leave it out entirely.

### When `interactable: true`

The object then requires a valid `action` and the fields that action
needs. Supported actions today:

#### `action: "sit"`

| Property | Tiled type          | Required |
| -------- | -------------------- | -------- |
| `action` | `string` = `"sit"`    | yes      |
| `seatX`  | `int`                 | yes      |
| `seatY`  | `int`                 | yes      |

#### `action: "teleport"`

| Property  | Tiled type               | Required |
| --------- | ------------------------- | -------- |
| `action`  | `string` = `"teleport"`    | yes      |
| `targetX` | `int`                      | yes      |
| `targetY` | `int`                      | yes      |

If `interactable: true` and `action` is missing, empty, or not one of the
supported values, the map is rejected. If `action` is `"sit"` without
`seatX`/`seatY` (or `"teleport"` without `targetX`/`targetY`), it is also
rejected.

> New actions (e.g. `open_door`) need backend work before they can be used.
> Writing a new value into `action` in Tiled alone is not enough yet.

## Ready made examples

**Wall (blocks movement, no interaction)**

```json
{
    "name": "north-wall",
    "type": "wall",
    "properties": [{ "name": "solid", "type": "bool", "value": true }]
}
```

**Rug (purely decorative)**
Does not need to become an object at all, resolve it just on the visual
tile layer.

**Chair (does not block, can be sat on)**

```json
{
    "name": "meeting-room-chair-1",
    "type": "chair",
    "properties": [
        { "name": "solid", "type": "bool", "value": false },
        { "name": "interactable", "type": "bool", "value": true },
        { "name": "action", "type": "string", "value": "sit" },
        { "name": "seatX", "type": "int", "value": 516 },
        { "name": "seatY", "type": "int", "value": 316 }
    ]
}
```

**Door (does not block, teleports)**

```json
{
    "name": "room-2-door",
    "type": "door",
    "properties": [
        { "name": "solid", "type": "bool", "value": false },
        { "name": "interactable", "type": "bool", "value": true },
        { "name": "action", "type": "string", "value": "teleport" },
        { "name": "targetX", "type": "int", "value": 800 },
        { "name": "targetY", "type": "int", "value": 200 }
    ]
}
```

**Counter (blocks and is interactable at the same time)**

```json
{
    "name": "reception-counter",
    "type": "desk",
    "properties": [
        { "name": "solid", "type": "bool", "value": true },
        { "name": "interactable", "type": "bool", "value": true },
        { "name": "action", "type": "string", "value": "teleport" },
        { "name": "targetX", "type": "int", "value": 120 },
        { "name": "targetY", "type": "int", "value": 640 }
    ]
}
```

## Tilesets and images

- On upload, the system reads the `name` of each entry in `tilesets` from
  the JSON, not the `image` field (which points to a local path on your
  computer that does not exist on the server).
- Upload one image per tileset, with the filename matching the tileset's
  `name` (the extension does not matter: `interior.png`, `interior.jpg`,
  etc. all match tileset `"interior"`).
- If the image for any referenced tileset is missing, the whole map is
  rejected.

## Checklist before uploading the map

- [ ] Every collision/interaction object has a descriptive `name` (it
      shows up in error messages).
- [ ] Purely decorative objects were not turned into objects, they stayed
      on the `tilelayer` only.
- [ ] Every object with `interactable: true` has a valid `action`
      (`"sit"` or `"teleport"`).
- [ ] Every object with `action: "sit"` has `seatX` and `seatY`.
- [ ] Every object with `action: "teleport"` has `targetX` and `targetY`.
- [ ] Each tileset's name in `tilesets` matches the filename of the image
      you are uploading alongside it.
