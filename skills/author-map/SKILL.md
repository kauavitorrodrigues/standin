---
name: author-map
description: Build a Standin map or a map template from a spec file with the standin CLI. Use when the user asks to create, fill, lay out or script a map, office, room, desk area or template from a description or a YAML spec, to create a service token for the CLI, to publish a template, or to apply a content folder with templates. For tilesets, assets and other library entries use author-content.
---

# Author maps and templates from a spec

A spec is a YAML (or JSON) file that names library items by `key` and compiles to the same editor operations the map editor sends. The CLI compiles it on this machine and sends the operations to the instance with a service token. Format: `docs/authoring-spec.md` (read it). Commands, scopes and exit codes: `apps/cli/README.md`. A working template with the library it needs is `examples/authoring/`. Run the CLI as `pnpm -s standin ...` from the repository root.

## 1. Get a token

A remote command needs the address of the instance and a service token with the scopes of the command (`apps/cli/README.md`, "Service tokens and scopes"). A token acts as the admin that owns it.

Prefer that the **user** creates the token on the admin screen of the instance (service tokens page), picking the scopes, and exports `STANDIN_TOKEN` in the shell that runs the CLI themselves. For authoring maps and templates from specs the scopes are `library:read maps:read maps:write templates:read templates:write`; add `library:write` for `content apply` of a library.

If the user asks you to create it, `token create` is server-side: it needs a checkout whose root `.env` (or `DATABASE_URL`) reaches the database. On a compose server the database listens on `127.0.0.1:${POSTGRES_PORT}`, so reach it with an SSH tunnel. The token is shown to you once (`result.token`): use it only through `STANDIN_TOKEN` for `login`, and never repeat it in chat, files, commits or reports.

```sh
pnpm -s standin token create --name agent --scope library:read maps:read maps:write templates:read templates:write --admin admin@example.com --json
```

Then, from the machine that runs the CLI:

```sh
STANDIN_TOKEN='<token>' pnpm -s standin login --url https://standin.example.com
pnpm -s standin library list
```

`library list` proves the address and the token work (exit 4 means the token or its scopes are wrong). Without `login`, set `STANDIN_URL` and `STANDIN_TOKEN` for each command. The URL must be `https` (`http` only for `localhost`).

## 2. Know the library

A spec can only use what the library has. List it, and read the exact `key` of each asset and the `name` of each tileset:

```sh
pnpm -s standin library list --json
```

Assets are referred to by `key`. **Tilesets are referred to by `name` (or id), never by their library key.** If an asset or tileset is missing, add it first with `skills/author-content/SKILL.md`.

## 3. Write the spec

Print the schema when you need to check a field: `pnpm -s standin schema print spec`. Every object is closed, an unknown field is an error. Coordinates are tiles from the top left; an object's anchor is its bottom left cell.

- `kind`: `map`, `template` or `area`. `map` and `template` need `sizeTier` (`XS` 24x16, `S` 30x20, `M` 48x32, `L` 64x48, `XL` 100x100 tiles at most); the map the spec is built on has to fit it. A `map` needs at least one `spawns` point; a `template` does not need one (it is allowed, not required).
- `style`: default `floor` (`tileset`, `tileIndex`) and `walls` (`tileset`, `style`) for rooms. The wall `style` is a style name in the tile meta of the tileset, with its 8 pieces.
- `rooms`: unique `key`, `label`, `x y width height` (at least 2 each way) and `doors` (`side` north, east, south or west, `door` = a key of the door family, optional `offset`). Keep desks and objects inside the room.
- `desks`: a `DESK` asset with `items` (a `SURFACE` asset such as a monitor, at the desk cell) and `chairs` (ordinary objects next to the desk; the `SIT` action of the chair asset decides who sits and which way).
- `objects`, `floors`, `zones`, `spawns`: see the doc. Steps run in a fixed order (floors, rooms, doors, zones, desks, objects, spawns), and the result is checked as a whole with the rules the server runs on publish.

Start from `examples/authoring/templates/small-office.yaml` or `packages/authoring/examples/office.yaml`, change it, and check often.

## 4. Check, then apply

On an existing map (ask the user for the map id; the map of a template is `mapId` in `template get`):

```sh
pnpm -s standin map validate ./office.yaml --map <map-id>
pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run
pnpm -s standin map apply ./office.yaml --map <map-id> --json
```

`map validate` reads the map and its palette and compiles locally; `--dry-run` also replays the operations on the server. Neither writes. `map apply` never asks to confirm.

**Applying adds content, it does not replace it.** Applying the same spec twice puts everything twice or fails on the objects already in place. To redo a map, start from a blank one (a new template draft, or a blank space), do not re-apply on top.

## 5. Templates

A template is a map that organization owners pick when they create a space. It starts as a draft and is **never published unless you ask**.

```sh
pnpm -s standin template create "Small office" --spec ./small-office.yaml --thumbnail ./small-office.png --dry-run
pnpm -s standin template create "Small office" --spec ./small-office.yaml --thumbnail ./small-office.png --json
pnpm -s standin template get <template-id>
pnpm -s standin template publish <template-id> --dry-run
pnpm -s standin template publish <template-id>
```

- `--dry-run` of `template create` checks only what is local (the PNG, that the spec parses and is of kind template, the size tier). It cannot compile the spec: that needs the map of the template, which does not exist yet. A key that is not in the library shows up on the real run, after the draft was made.
- `--publish` (on `template create` or `content apply`) needs a PNG thumbnail, at most 3 MB. The server refuses to publish without one.
- A content folder with `templates/<name>.yaml` (and `<name>.png` as its thumbnail) is applied with `pnpm -s standin content apply ./folder --dry-run`, then without `--dry-run`. It matches templates by name: one that exists is left untouched (`exists`), because re-applying would duplicate its content. To change it, edit it in the editor or delete it on the admin screen and run again. `maps/` in the folder is ignored.

## 6. When a command fails

Use `--json`: the error is one document, `{"ok":false,"error":{"code","message","path?","fix?","issues?","details?"}}`. Act on the exit code:

- **3** input rejected: read `error.issues` (`{opIndex, code, path, message}`; `path` points into the spec), fix the spec at that path, `map validate` again. A 404 on `--map` is also 3: the map id is wrong.
- **4** token or scope: `SERVICE_TOKEN_SCOPE_MISSING` names the scope in `fix`; create a token that has it. `SERVICE_TOKEN_OWNER_INVALID`: the admin was demoted or removed, create a token with an active admin.
- **5** unreachable: the instance is down, the URL is wrong, the server redirected (the error shows where) or answered with something that is not the API. Check `https` and the address.
- **6** conflict: `STALE_LAYOUT_VERSION` (409) means the map changed since it was read, and the error carries the current `version`. Run `map validate` again and review that the spec still fits before passing `--base-version`. `MAP_LOCKED` (423) means an editor has the map open (`by`, `since`): wait or ask the person, never force it.
- **1** unexpected: report the error as it is.

Applying is not transactional. After a partial `template create` or `content apply`, `details.completed` lists what was done, `pending` what was not, `unfinished` a draft this run created but did not finish (finish it in the editor, publish it with `template publish`, or delete it on the admin screen), and `uncertain` a write that may have happened when the connection failed: check `template list` or `library list` before you run again.

## Done when

`map apply` or `template create` ended with exit 0, `template get <id>` shows the expected `status` (`DRAFT` unless the user asked to publish), and you told the user what exists on the instance and what is still a draft.
