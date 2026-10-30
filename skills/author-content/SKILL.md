---
name: author-content
description: Author the library of a Standin instance from files with the standin CLI. Use when the user asks to add or change tilesets, wall styles, assets (chairs, desks, doors, decoration), variants, bundles, areas or avatar parts, to build or check a library.json and its PNGs, or to load a content folder into an instance. For maps and templates built from a spec use author-map.
---

# Author library content

The library (tilesets, assets, areas, avatar parts) is described by a folder with a `library.json` and the PNGs it names. The CLI checks the folder on this machine and loads it into an instance. A complete working folder is `examples/authoring/`: copy its shape. The commands, scopes and exit codes are in `apps/cli/README.md`; the rules are in the code (see "Where the rules are"). Follow them over anything remembered here. Run the CLI as `pnpm -s standin ...` from the repository root.

## Workflow

1. Write the folder (below). The JSON Schema of the file tells you every field and its limits: `pnpm -s standin schema print library` (or `library-tileset`, `library-asset`, `library-variant`, `library-area`).
2. Check it locally. It sends nothing and needs no token; it lists every issue at once as `{file, path, message}` (exit 3):

```sh
pnpm -s standin content validate ./my-content
```

3. Ask the instance, which writes nothing. It needs `STANDIN_URL` and `STANDIN_TOKEN` (see `skills/author-map/SKILL.md` for the token) and the scopes `library:write` and `library:read`, plus `templates:read` when the folder has templates (the dry run lists the existing ones):

```sh
pnpm -s standin content apply ./my-content --dry-run
```

4. Apply, then look at the result:

```sh
pnpm -s standin content apply ./my-content
pnpm -s standin library list --json
```

The seed is idempotent by `key`: a second run says `unchanged` and never deletes. A field the entry leaves out is not compared, so a seed does not undo an edit made in the editor. `content apply` also creates the templates of the folder (`templates/`): leave that folder out when you only want the library.

On the machine that hosts the instance there is a server-side alternative that reads the same folder and needs no token, only the root `.env` and the database: `pnpm -s standin seed library ./my-content --dry-run`, then without `--dry-run`. It seeds the library only and needs an admin to exist. From a machine that cannot reach the database, use `content apply` with a token.

## The folder

```text
my-content/
  library.json         tilesets, assets (with variants), bundles, areas, avatarBases, avatarParts
  tilesets/floor.png   every PNG is named by a relative `file` in library.json
  assets/chair.png
  templates/           optional, see author-map
```

The upload limits (number of PNGs, sizes of a file, of `library.json` and of the whole upload) are checked before sending; they are `MAX_SEED_*` in `packages/contracts/src/assets/consts/library.ts`. A path that leaves the folder is an issue.

## Recipes

- **Grid.** Everything is on a 32 px grid. A tileset sheet is cut in 32 px tiles (`margin` and `spacing` default to 0). An asset PNG has both sides multiples of 32; an animated asset is a horizontal strip of `frameCount` equal frames.
- **Tileset.** `key`, `name`, `file`, and `tileMeta`, keyed by tile index (row by row from 0). A tile without a `category` (`FLOOR`, `WALL`, `CEILING`, `DECORATION`, `EMPTY`) does not exist for the editor, so list every tile that should be usable. `solid: true` blocks avatars. `blankDefault` marks the one `FLOOR` and the one `WALL` tile that blank maps are generated from; there can be only one of each across the global library, so leave it out unless the instance has none.
- **Wall styles.** A style is eight pieces `n ne e se s sw w nw` (four sides, four corners). Each piece is a tile with `category: "WALL"`, `style: "<name>"` and `edges` (`["N"]`, `["N","E"]`...; the sets are in `WALL_PIECE_EDGES`). `top` is the tile drawn above a tall piece, `overlap` the rows that draw over an avatar behind it, `solidMask` a 4x4 collision grid (a side piece blocks only its trace). A style with fewer than 8 pieces is refused by rooms. See the tileset `examples/authoring/tilesets/brick.png` and its `tileMeta` for a working sheet (caps on the top row, bases below).
- **Asset.** `key`, `name`, `type`, `footprint {w, h}` in tiles, `file`. `type` and `category` are enums (`packages/contracts/src/assets/enums/`); every type has a default category except `DECORATION`, which must set one. The footprint must fit the sprite in tiles (`offsetX + w`, `h`).
- **Placement.** `GROUND` (default), `SURFACE` (sits on a `TABLE` or `DESK`; a monitor), `WALL` (posters, windows). `RUG` is drawn below avatars and stays walkable.
- **Footprint and collision masks.** `footprint.mask` says which cells are occupied and `footprint.solidMask` which of those block movement, each `h*4` rows by `w*4` columns of booleans. Do not write them by hand: `createFootprintMasks` in `@standin/authoring` builds them from rectangles and checks them with the schema's own functions. Without masks the whole rectangle is occupied and blocks.
- **Seats.** `action: "SIT"` with `actionParams: {seats: [{dx, dy, facing}]}`. `dx` is pixels from the left edge of the sprite and `dy` pixels up from its bottom edge (first frame); `facing` is `UP`, `DOWN`, `LEFT` or `RIGHT`, the way the avatar looks. `actionParams` without an action is refused. A spec places chairs as ordinary objects; who sits and which way comes from here.
- **Variants.** Colors and rotations are rows of the same family: `variants: [{key, rotation, color: {key, hex}, footprint, file}]`. Name, type, category, placement, solid, action and animation are the same across the family (`validateFamily.ts`). A door family has the base at `rotation: "DEG_0"` (north) and variants `DEG_90` (east), `DEG_180` (south), `DEG_270` (west); a spec's `door:` takes any key of the family and the variant that fits the wall side is picked. In the example, north and south doors are 2x1 and east and west 1x2.
- **Bundles.** `bundles: [{asset, parts: [{partAsset, offsetX, offsetY}]}]`: placing the root places the parts. Root and parts are assets by key; an empty `parts` clears them.
- **Areas.** `areas: [{key, name, file, stamp}]`, where `file` is a thumbnail of the stamp size times 32 px and the stamp names tilesets and assets by `tilesetKey` and `assetKey`. Up to 16x12 tiles. Shape: `docs/map-editor.md` section 3.
- **Avatars.** `avatarBases` and `avatarParts` (sheet `file`, `preview`, `slot`, optional color `variations`). The sheet size and the rest: `docs/avatar.md` and `docs/map-editor.md` section 3.

## Where the rules are

`library.json` schema `packages/contracts/src/assets/schemas/library-seed.schema.ts`; assets and families `.../asset-definition.schema.ts`, `.../utils/validateFamily.ts`; tile meta `.../tile-meta.schema.ts`, `.../utils/wallStyle.ts`; seat params `.../action-params.schema.ts`; footprint fit `packages/core/src/features/assets/utils/ruleIssues.ts`; the order sections are applied in `docs/map-editor.md` section 3.

## Traps

- `content validate` passing does not mean the instance accepts it: it does not decode images or resolve keys. A PNG that is not a valid image, or a key that does not exist, shows only on a real `content apply`. Fix and run again: the library is idempotent.
- A tileset has a `key` in `library.json`, but a spec finds it only by `name` (or id). Give tilesets distinct, spec-friendly names.
- The `key` identifies an entry: a run with another key creates another entry, it does not rename. Prefix the keys of a pack so they stay recognizable in `library list`.
- Applying stops at the first failure with the exit code of that failure. Read `details.completed` and `pending` of the error (`--json` gives them as one document), fix the cause and run again.
- `maps/` in the folder is ignored with a warning.
- Do not add real artwork to this repository: pull requests carry only tiny flat fixtures (`CONTRIBUTING.md`).
