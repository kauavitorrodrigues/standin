# standin CLI

Operates a Standin instance from the shell. These commands run where the
instance is hosted: they read the root `.env` and use the database directly.

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

| Command                 | What it does                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bootstrap`             | Creates the first admin and organization. Safe to run again.                                                      |
| `seed library [folder]` | Seeds the global library. Default library without a folder, `library.json` and its PNGs with one. Needs an admin. |
| `health`                | Runs the health check. Exit 0 when ok or degraded (reported), exit 5 when down.                                   |

`bootstrap` values come from the flag, or from the variable when the flag is
missing: `--email`/`ADMIN_EMAIL` (required), `--password`/`ADMIN_PASSWORD`
(generated and printed once when missing), `--name`/`ADMIN_NAME`,
`--organization`/`ORGANIZATION_NAME`.

A relative `folder` is read from the directory you typed the command in.

## Global flags

- `--json`: one JSON document on stdout, also for errors.
  `{"ok":true,"command":"...","result":{...}}` or
  `{"ok":false,"error":{"code","message","path?","fix?"}}`.
- `--dry-run`: checks the input and says what would happen. It never writes
  and never reads the database, so it does not say what already exists there.
- `--yes`: accepted by every command; no command of this version asks to
  confirm.
- `--help`: usage and examples.

A missing required value is asked for only when stdin and stdout are both
terminals and `--json` is not set. Otherwise it is a usage error (exit 2).

## Exit codes

| Code | Meaning                                          |
| ---- | ------------------------------------------------ |
| 0    | Success                                          |
| 1    | Unexpected error                                 |
| 2    | Usage: unknown or missing flag or value          |
| 3    | Input rejected (HTTP 400 or 422 from the domain) |
| 4    | Authentication or permission (401 or 403)        |
| 5    | A dependency is unreachable (health is down)     |
| 6    | Conflict (409)                                   |

## Examples

```sh
pnpm -s standin bootstrap --email admin@example.com --json
ADMIN_EMAIL=admin@example.com pnpm -s standin bootstrap --dry-run
pnpm -s standin seed library
pnpm -s standin seed library ./my-library --dry-run --json
pnpm -s standin health
```
