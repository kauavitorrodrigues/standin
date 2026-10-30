# standin CLI

Operates a Standin instance from the shell, in two tiers:

- **Server-side commands** (`bootstrap`, `seed library`, `health`, `token ...`)
  run where the instance is hosted: they read the root `.env` and use the
  database directly. No login.
- **Remote commands** (`map ...`, `library list`, `login`, `logout`) go through
  the API with a service token. They never import the core and need no `.env`
  or database. `schema print` needs neither.

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

| Command                       | Scopes                   |
| ----------------------------- | ------------------------ |
| `map validate`                | `maps:read`              |
| `map apply` (and `--dry-run`) | `maps:read` `maps:write` |
| `library list`                | `library:read`           |

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
- `--yes`: accepted by every command. Only `token revoke` needs it, and only
  at a terminal. `map apply` never asks for confirmation: it is the agent flow
  and has `--dry-run` to check first.
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
server or the spec checks found) and `details` (`version`, `by`, `since`). A
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
pnpm -s standin schema print spec > spec.schema.json
```
