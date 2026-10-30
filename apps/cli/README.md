# standin CLI

Operates a Standin instance from the shell, in two tiers:

- **Server-side commands** (`bootstrap`, `seed library`, `health`, `token ...`)
  run where the instance is hosted: they read the root `.env` and use the
  database directly. No login.
- **Remote commands** (`map ...`, `library list`, `template ...`,
  `content apply`, `login`, `logout`) go through the API with a service token.
  They never import the core and need no `.env` or database. `schema print`
  and `content validate` need neither a network nor a token.

```sh
pnpm -s standin --help
pnpm -s standin <command> --help
```

Always use `pnpm -s standin ...` (`--silent`): without `-s` pnpm adds its own
`$ pnpm ...` line on stderr and, when the command exits with an error, an
`ELIFECYCLE` line on stdout after the JSON, which breaks parsing.

The script runs from `apps/api` (and finds the root `.env` from there), because
the local storage writes `public/` under the working directory and that is the
folder the API serves. A relative folder argument is read from the directory
you typed the command in (pnpm gives it as `INIT_CWD`). The `standin` bin is a
TypeScript file run by `tsx`, so this private app needs `tsx` on the PATH
(pnpm provides it through the workspace).

## Commands

| Command                      | What it does                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bootstrap`                  | Creates the first admin and organization. Safe to run again.                                                      |
| `seed library [folder]`      | Seeds the global library. Default library without a folder, `library.json` and its PNGs with one. Needs an admin. |
| `health`                     | Runs the health check. Exit 0 when ok or degraded (reported), exit 5 when down.                                   |
| `token create\|list\|revoke` | Manages service tokens (server-side, see below).                                                                  |
| `login` / `logout`           | Saves or deletes the URL and token for the remote commands.                                                       |
| `map validate <spec>`        | Checks a map spec against a map of the instance. Writes nothing.                                                  |
| `map apply <spec>`           | Builds the spec on a map and applies it.                                                                          |
| `library list`               | Lists tilesets, assets and areas of the global library.                                                           |
| `template create <name>`     | Creates a template, optionally fills its map from a spec, uploads its thumbnail and publishes it.                 |
| `template get <id>`          | Shows one template.                                                                                               |
| `template list`              | Lists the templates, drafts and published.                                                                        |
| `template publish <id>`      | Publishes a draft template.                                                                                       |
| `content validate <folder>`  | Checks a content folder (library and templates) on this machine. Sends nothing.                                   |
| `content apply <folder>`     | Seeds the library of a content folder, then creates its templates.                                                |
| `schema print <kind>`        | Prints a JSON Schema. No network.                                                                                 |

`bootstrap` values come from the flag, or from the variable when the flag is
missing: `--email`/`ADMIN_EMAIL` (required), `--password`/`ADMIN_PASSWORD`
(generated and printed once when missing), `--name`/`ADMIN_NAME`,
`--organization`/`ORGANIZATION_NAME`.

A relative `folder` (or spec path) is read from the directory you typed the
command in.

## Remote commands

A remote command needs the address of the API and a service token. Each value
comes from, in this order:

1. the flags `--url` and `--token`;
2. the variables `STANDIN_URL` and `STANDIN_TOKEN`;
3. the file written by `standin login`.

The login file is a pair. Its token is used only when the URL is the saved
one, and its URL only together with its token: a token from the flags or the
environment is never sent to a saved URL (give `--url` or `STANDIN_URL` too),
and a different `--url` needs its own token. The URL must be `https`; plain
`http` is accepted only for `localhost`, `127.0.0.1` and `::1`. Redirects are
not followed (exit 5, the error shows where the server pointed), and a 200 that
is not a JSON object, such as the web app, is exit 5 too.

```sh
# Once per machine. Prefer the variable for the token: a flag stays in the
# shell history. The token is never printed, nor written to a log.
STANDIN_TOKEN='<token>' pnpm -s standin login --url https://standin.example.com

# Or per command, with no file at all.
STANDIN_URL=https://standin.example.com STANDIN_TOKEN='<token>' pnpm -s standin library list

pnpm -s standin logout   # deletes the file; the token stays valid on the server
```

`login` writes `$XDG_CONFIG_HOME/standin/config.json` (`~/.config/standin/config.json`
when the variable is not set). The file is mode `0600` and its folder `0700`, written to a temporary file and
renamed over the old one. A relative `XDG_CONFIG_HOME` is ignored. A file that
cannot be read (permissions, a folder in its place) is exit 2 with a `fix`.
`login` sends nothing: a wrong token shows on the first remote command (exit 4).
There is no email and password fallback. Without a URL or a token the exit is 2
with a `fix`, never a prompt.

### Service tokens and scopes

Remote commands authenticate with a service token, created by `token create`
or on the admin screen. Reading and writing are separate scopes:

| Command                         | Scopes                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `map validate`                  | `maps:read`                                                                                                                             |
| `map apply` (and `--dry-run`)   | `maps:read` `maps:write`                                                                                                                |
| `library list`                  | `library:read`                                                                                                                          |
| `template get`, `template list` | `templates:read`                                                                                                                        |
| `template create`               | `templates:write`; with `--spec` also `maps:read` `maps:write`                                                                          |
| `template publish`              | `templates:write` (and `templates:read` with `--dry-run`)                                                                               |
| `content validate`              | none, it is local                                                                                                                       |
| `content apply`                 | `library:write` when the folder has a `library.json`; `templates:read` `templates:write` `maps:read` `maps:write` when it has templates |
| `content apply --dry-run`       | `library:write` for the library, `templates:read` for the templates (nothing is written)                                                |

A token acts as the active admin that owns it. If that admin is demoted or
removed the API answers `SERVICE_TOKEN_OWNER_INVALID` (exit 4); create another
token with an active admin. A token without a needed scope answers
`SERVICE_TOKEN_SCOPE_MISSING` (exit 4) and the `fix` names the scope.

### `map validate` and `map apply`

```sh
pnpm -s standin map validate ./office.yaml --map <map-id>
pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run
pnpm -s standin map apply ./office.yaml --map <map-id> --json
pnpm -s standin map apply ./office.yaml --map <map-id> --base-version 12
```

The spec is a YAML or JSON file (`pnpm -s standin schema print spec` prints its
format). `--map` is required; the CLI reads the map (`GET /maps/:id/render`) and
its palette (`GET /maps/:id/library`), compiles the spec to editor ops locally
and prints the issues `{opIndex, code, path, message}` (exit 3) when it cannot.
`map apply` then sends `POST /maps/:id/apply` with the ops. `--base-version`
defaults to the version just read; `--dry-run` sends `validateOnly` and writes
nothing. A spec of `kind: area` is refused (it is a library entry); `map` and
`template` specs apply to a map.

A stale `--base-version` answers 409 and a map an editor has open answers 423,
both exit 6; the error carries the current `version`, or `by` and `since`.

### `template ...`

```sh
pnpm -s standin template create "Open office" --size-tier S
pnpm -s standin template create "Open office" --spec ./open-office.yaml --thumbnail ./open-office.png --dry-run
pnpm -s standin template create "Open office" --spec ./open-office.yaml --thumbnail ./open-office.png --publish --json
pnpm -s standin template list --size-tier S
pnpm -s standin template get <template-id>
pnpm -s standin template publish <template-id> --dry-run
pnpm -s standin template publish <template-id>
```

`template create` creates the template as a draft (`POST /templates`) and then,
in this order and only when asked: `--spec` builds a spec of `kind: template`
on the map of the template (the map is read, the spec compiled to editor ops
and applied, exactly like `map apply`), `--thumbnail` uploads a PNG, and
`--publish` publishes it. A template is **never** published by default, and
`--publish` needs `--thumbnail` (the server refuses to publish without one;
exit 2 before any request). `--size-tier` (`XS`, `S`, `M`, `L`, `XL`) can be
left out with `--spec`, which then gives it; with both they must match.
`--description` is optional. The thumbnail is checked to be a PNG of at most
3 MB before any request.

The steps are not transactional. If one fails, the ones before stay on the
instance and the error says so (see [Partial work](#partial-work)); the id of
the draft is in `details.completed`.

`--dry-run` checks only what is local: that the PNG is a PNG, that the spec
parses and is of kind template, the size tier. It sends nothing at all, not
even a read. It cannot compile the spec: that is done on the map of the
template, which does not exist yet, so a spec whose keys are not in the library
fails only on a real run (after the draft was made, see above).

`template get` and `template list` are read-only (`--json` prints the template
as the API gives it). `template publish --dry-run` reads the template and says
whether it is a draft that can be published.

### `content validate` and `content apply`

A content folder holds a library and map templates:

```text
content/
  library.json            the library, as `seed library` reads it
  tilesets/floor.png      the PNGs library.json names, by relative path
  assets/crate.png
  templates/
    open-office.yaml      a spec of kind template (.yaml, .yml or .json)
    open-office.png       its thumbnail (same name, .png), optional
    lounge.yaml
  maps/                   not handled: reported as ignored (a warning)
```

Both parts are optional, but a folder with neither is exit 3 with a `fix`. A
template is called as the `name` of its spec, or as the name of its file when
the spec has none; the description is empty.

```sh
pnpm -s standin content validate ./content
pnpm -s standin content apply ./content --dry-run
pnpm -s standin content apply ./content
pnpm -s standin content apply ./content --publish --json
```

`content validate` runs on this machine, with no URL and no token, and sends
nothing. It checks `library.json` against its schema, that every PNG it names
exists, is a PNG and is at most 3 MB, the limits of the upload (300 files,
`library.json` 4 MB, 64 MB in all), and every template spec against the spec
schema. It lists all the issues at once as `{file, path, message}` (exit 3).
What needs the instance (that library keys exist, that a spec fits its map) is
not checked: `content apply --dry-run` asks the server for the library part.

`content apply` runs the same checks first (nothing is sent if any fails, and
they come before the URL and the token are looked for), then:

1. **Library.** `library.json` and its PNGs go to `POST /library/seed`, a
   multipart upload where each PNG is a part named by the path written in
   `library.json`. The seed is idempotent by key: a second run says
   `unchanged`.
2. **Templates.** Each spec is matched to a template **by name**
   (`GET /templates`):
    - no template has the name: it is created, its spec is applied to its map,
      its thumbnail is uploaded, and it is published only with `--publish`;
    - the template exists: it is **not touched** and is reported as `exists`.
      The spec is not applied again, because applying ops adds content (it does
      not replace it), so a second apply would put everything twice or fail on
      the objects already in place. To change an existing template, edit it in
      the editor, or delete it on the admin screen and run the command again.
      A retired template with the name counts as existing;
    - the template exists as a **draft** and `--publish` is given: it is
      published as it is. That finishes a run that failed at the publish step
      itself (the content and the thumbnail were already there). A draft with
      no thumbnail on the instance cannot be published: the command refuses it
      before writing anything (exit 3, `CLI_TEMPLATE_NOT_PUBLISHABLE`); finish
      it in the editor, or delete it on the admin screen and run again. One
      already published is `unchanged`.
      With `--publish` a template that is going to be created needs its
      thumbnail beside the spec (the command refuses before any write when it
      lacks it); one that already exists needs no local file.

Everything read from the folder stays inside it: the folder is resolved once
and so is each file. A link that leaves the folder (a PNG, `library.json`, a
spec, a thumbnail, or `templates/` itself) is an issue and is never followed;
a link that stays inside is followed. A name in `library.json` that the upload
cannot carry is an issue too: a path that leaves the folder, a name over 255
bytes, one with a double quote or a line break, or `library` (the name of the
`library.json` part).

Limits (checked here before the request, and by the server): 300 PNG files, 3
MB each, `library.json` 4 MB, 64 MB for the whole upload (counted with about
150 bytes of framing per part, an estimate: the server has the last word); a
thumbnail is at most 3 MB. The size of a file is asked first, so a file that
is over the limit is never read, and reading stops when the total crosses it.

`content apply --dry-run` writes nothing. For the library it calls
`POST /library/seed?dryRun=true`: the server only parses `library.json` and
checks that every file it names came with the upload; it does not decode the
images nor resolve the keys, so a PNG that is not a valid image or a key that
does not exist shows only on a real run. For the templates it lists the
existing ones by name (read before the library, so a `--publish` that cannot
finish is refused here too) and says what would be created or published; it
does not compile the specs, which needs the template to exist. It needs the URL and a
token with `library:write` (library) and `templates:read` (templates).

#### Partial work

Applying is not transactional and stops at the first failure, with the exit
code of that failure. The error (also with `--json`, as one document) lists in
`details`:

- `completed`: what was already done, e.g.
  `{"target":"template","name":"Open office","action":"created","id":"..."}`
  (the steps of a template are `created`, `spec applied`, `thumbnail uploaded`,
  `published`; the library is `seeded`). A failure that is not one of the
  CLI's own (a bug, an answer that is not the API) is reported the same way,
  as `CLI_INTERNAL` (exit 1) with the work done;
- `pending`: the library and the templates that were not finished, each as
  `{target, name}` (a template called `library` is not the library; the one
  that failed is still in it);
- `uncertain`: when the connection failed (or timed out) while a write was on
  its way, that step as `{target, name}`. The write may have happened, so the
  `fix` says to check `template list` or `library list` before running again.
  The seed has 5 minutes to answer, a thumbnail 2, the other writes 1;
- `unfinished`: a template this run created but did not finish, `{name, id}`.
  The `fix` says what to do with it: finish it in the editor, publish it with
  `template publish`, or delete it on the admin screen and run again (a rerun
  would find it by name and leave it as it is).

The library is idempotent, so running `content apply` again after fixing the
cause is safe for it.

### `library list` and `schema print`

`library list` prints the tilesets (key, name), the assets (one per family,
by key) and the areas (name and id). `schema print <kind>` prints the JSON
Schema, `kind` being `spec`, `library`, `library-tileset`, `library-asset`,
`library-variant` or `library-area` (the `.schema.json` name works too).
With `--json` the schema is inside the usual envelope.

## Token commands (server-side)

These use the database like `bootstrap`; the API has no route a token can use
to manage tokens.

```sh
pnpm -s standin token create --name agent --scope maps:read maps:write library:read
pnpm -s standin token create --name ci --scope library:read --expires-at 2027-01-01T00:00:00Z --admin admin@example.com --json
pnpm -s standin token list
pnpm -s standin token revoke <id> --yes
```

- `create` shows the token once, in the result (`result.token` with `--json`,
  one line otherwise). It is never logged. The owner is `--admin <email>` (or
  `ADMIN_EMAIL`); without either, the only active admin is used. With several
  admins and none chosen, or an email that is not an active admin, it is a
  usage error (exit 2) that lists the admins. `--dry-run` checks the input and
  prints the plan without reading the database.
- `list` prints the id, prefix, name, scopes and status (`active`, `revoked`,
  `expired`), never the token.
- `revoke <id>` asks for `--yes` when stdin and stdout are terminals and
  `--json` is not set (exit 2 without it). Without a terminal it revokes, so
  agents are never blocked.

## Global flags

- `--json`: one JSON document on stdout, also for errors.
  `{"ok":true,"command":"...","result":{...}}` or
  `{"ok":false,"error":{"code","message","path?","fix?"}}`.
- `--dry-run`: checks the input and says what would happen. It never writes
  and never reads the database, so it does not say what already exists there.
  For `map apply` it sends `validateOnly`, so the server replays the ops.
  `template create --dry-run` sends nothing, `template publish --dry-run`
  reads, and `content apply --dry-run` runs the dry run of the library seed
  and reads the templates (see their sections for what each one checks).
- `--yes`: accepted by every command. Only `token revoke` needs it, and only
  at a terminal. `map apply` never asks for confirmation: it is the agent flow
  and has `--dry-run` to check first. The same goes for `template` and
  `content apply`.
- `--help`: usage and examples.

A missing required value is asked for only when stdin and stdout are both
terminals and `--json` is not set. Otherwise it is a usage error (exit 2).

## Exit codes

| Code | Meaning                                                                                                    |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 0    | Success                                                                                                    |
| 1    | Unexpected error                                                                                           |
| 2    | Usage: unknown or missing flag or value                                                                    |
| 3    | Input rejected (HTTP 400, 422, or a bad spec)                                                              |
| 4    | Authentication or permission (401 or 403)                                                                  |
| 5    | Unreachable: health is down, the API does not answer, redirects, 502-504, or an answer that is not the API |
| 6    | Conflict (409 stale layout, 423 map locked)                                                                |

An error from the API keeps the code of the server (`SERVICE_TOKEN_SCOPE_MISSING`,
`STALE_LAYOUT_VERSION`, `MAP_LOCKED`...) and may carry `issues` (the list the
server or the spec checks found; for a content folder each has the `file`) and
`details` (`version`, `by`, `since`, and `completed`, `pending`, `unfinished`
after a partial `template create` or `content apply`). A
404 from the API (a map that does not exist) is exit 3, any other 5xx is exit 1.

## Examples

```sh
pnpm -s standin bootstrap --email admin@example.com --json
ADMIN_EMAIL=admin@example.com pnpm -s standin bootstrap --dry-run
pnpm -s standin seed library
pnpm -s standin seed library ./my-library --dry-run --json
pnpm -s standin health
pnpm -s standin token create --name agent --scope maps:read maps:write library:read --json
pnpm -s standin login --url http://localhost:3001 --token '<token>'
pnpm -s standin map validate ./office.yaml --map <map-id>
pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run --json
pnpm -s standin library list --json
pnpm -s standin template create "Open office" --spec ./open-office.yaml --thumbnail ./open-office.png --dry-run
pnpm -s standin template list --size-tier S --json
pnpm -s standin content validate ./content
pnpm -s standin content apply ./content --dry-run --json
pnpm -s standin content apply ./content --publish
pnpm -s standin schema print spec > spec.schema.json
```
