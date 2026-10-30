# Agent guide

Standin is a 2D virtual office with a built-in map editor. This file is for agents (and people) who change the code, deploy it, or author content with the CLI. Read the linked source before relying on a summary: rules live in code and in `docs/`, and this file points at them.

## Repository map

| Path                    | What it is                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/api`              | Express API, Socket.IO and the media server. Scripts: `bootstrap`, `seed:library`                |
| `apps/web`              | The React and Phaser client                                                                      |
| `apps/cli`              | The `standin` CLI, see [apps/cli/README.md](apps/cli/README.md)                                  |
| `packages/contracts`    | Shared schemas, types and pure rules (assets, maps, editor ops). Change the contract first       |
| `packages/authoring`    | Pure spec compiler: YAML spec to editor ops. [README](packages/authoring/README.md)              |
| `packages/core`         | Services and repositories used by the API and by the server-side CLI commands                    |
| `packages/database`     | Drizzle schema and migrations. `packages/auth`, `infra`, `media`, `config`: the rest             |
| `docs`                  | Guides; start with [authoring-spec](docs/authoring-spec.md) and [map-editor](docs/map-editor.md) |
| `skills`                | Agent skills: `deploy`, `author-content`, `author-map`. See [skills/README.md](skills/README.md) |
| `deploy`, `compose.yml` | Server scripts and the compose stack. See [docs/deployment.md](docs/deployment.md)               |
| `content`               | First-party media pack (CC BY 4.0). Maintainers only, do not touch                               |
| `ee`                    | Enterprise directory with its own license. Leave it alone unless asked                           |
| `examples/authoring`    | A small content folder that `content validate` accepts (CC BY 4.0). See its README               |

## Commands

Always run the CLI as `pnpm -s standin <command>`. The `-s` matters: without it pnpm adds lines that break `--json` parsing.

```sh
pnpm -s standin --help
pnpm -s standin content validate examples/authoring
pnpm -s standin schema print spec
pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run --json
```

On a compose server the API scripts run in the `app` container, for example `docker compose exec -T app pnpm --filter api seed:library` (see `skills/deploy/SKILL.md`; the first admin comes from `docker compose exec -T app pnpm --filter api bootstrap`).

The full list, scopes, exit codes and the content folder layout are in [apps/cli/README.md](apps/cli/README.md). Workflows are in the skills: `skills/author-content/SKILL.md` (library: tilesets, assets, areas, avatar parts), `skills/author-map/SKILL.md` (maps and templates from a spec) and `skills/deploy/SKILL.md` (servers).

## Where the authoring rules live

Do not copy these rules into docs or prompts, they change. Read the code.

| Rule                                             | File                                                                                                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `library.json` shape and its JSON Schemas        | `packages/contracts/src/assets/schemas/library-seed.schema.ts`, `packages/authoring/schemas/`                                                   |
| Asset fields, types, categories, placement       | `packages/contracts/src/assets/schemas/asset-definition.schema.ts`, `enums/`                                                                    |
| Footprint fit, `SIT` and `TELEPORT` params       | `packages/core/src/features/assets/utils/ruleIssues.ts`, `packages/contracts/src/assets/schemas/action-params.schema.ts`                        |
| Footprint and collision masks                    | `createFootprintMasks` in `packages/authoring/src/masks/footprintMasks.ts`                                                                      |
| Tile meta, wall styles (8 pieces), door families | `packages/contracts/src/assets/schemas/tile-meta.schema.ts`, `utils/wallStyle.ts`, `utils/validateFamily.ts`, `consts/door.ts`                  |
| Spec format and compile order                    | `packages/authoring/src/spec/schemas/`, `packages/authoring/src/spec/compile/`                                                                  |
| Map size tiers, what a draft must satisfy        | `packages/contracts/src/maps/consts/size-tiers.ts`, `maps/editor/utils/validateEditorOps.ts`                                                    |
| Upload limits, content folder layout, exit codes | `packages/contracts/src/assets/consts/library.ts` (`MAX_SEED_*`), `apps/cli/src/commands/content/consts.ts`, `apps/cli/src/consts/exitCodes.ts` |

## Rules for agents

- The only password you may show is the admin password that `bootstrap` generates and prints once: give it to the user in the reply, never to a file, log, commit or report.
- Never print `.env`, other secrets or the output of `docker compose config`. Check that a variable is set without showing its value.
- Never run `docker compose down -v`, `docker volume rm` or anything else that can delete the database or the uploads.
- A service token is never put in output, a log, a commit or a report. Prefer `STANDIN_TOKEN` in the environment over `--token`, which stays in the shell history. `standin login` saves the URL and token you give it.
- Use `--json` when you parse the output. It prints exactly one document on stdout, also on error. Without a terminal the CLI never prompts: a missing value is exit 2 with a `fix`.
- Check before you write: `content validate`, `map validate`, `--dry-run`. Applying is not transactional; read `details.completed`, `pending`, `unfinished` and `uncertain` of an error before you retry.
- Exit codes: 0 ok, 1 unexpected, 2 usage, 3 input rejected, 4 auth or scope, 5 unreachable, 6 conflict. The table is in the CLI README.
- Every deploy restarts the API and drops every connection. Ask first.
- Do not add images or other media to pull requests (see [CONTRIBUTING.md](CONTRIBUTING.md)); the PNGs of `examples/authoring` are tiny flat fixtures made by the maintainer, listed in CONTRIBUTING.

## Traps that already cost time

- A tileset has a `key` in `library.json`, but a spec finds it only by `name` or id. Assets are found by `key`.
- A `DECORATION` asset needs a `category`. A tileset needs `tileMeta` with a `category` for each tile that should exist (for example `FLOOR`); a wall style needs its 8 pieces.
- `blankDefault` marks one `FLOOR` and one `WALL` tile across the global library. Do not set it on an instance that already has a default library.
- Applying a spec twice puts everything twice or fails. `content apply` finds templates by name and leaves an existing one untouched.
- `maps/` in a content folder is ignored (a warning). `content validate` does not know the instance: unknown keys show up in `content apply --dry-run` or on the real run.
- `template create --dry-run` and `content apply --dry-run` cannot compile a spec. `--publish` needs a PNG thumbnail. `map apply` answers 409 on a stale `--base-version` and 423 when someone has the map open (both exit 6).
- A token from the flags or the environment is never sent to a saved URL: give `--url` or `STANDIN_URL` too.

## Code rules

- No `else` and no `else if`: use early returns, guard clauses, lookup tables or `switch`. Branch on discriminants with `switch`.
- Utility types go in `types` files, not inline in the implementation.
- Never `throw new Error(...)`. Every error is a class extending `BaseError` (`packages/contracts/src/errors/base.ts`), one per error, in the `errors.ts` of its domain.
- Controllers never touch the database: controller, service, repository. New code keeps queries in repositories.
- Contract changes go through `packages/contracts` first. Dependencies are saved with exact versions.
- 4 spaces, double quotes, short English comments that say why. Code and docs are in English. `pnpm exec prettier --check <files>` before you finish.

## Tests

Run one test file at a time, never the whole suite or several packages in parallel (it can exhaust the machine): `pnpm --filter <package> exec vitest run <file> --maxWorkers=1 --no-file-parallelism`, and `pnpm --filter <package> check-types` alone. Integration tests need `INTEGRATION_DATABASE_URL` pointing at a throwaway database and are skipped without it. The commands written in the docs are tested in `apps/cli/src/__tests__/docCommands.test.ts` and the example folder in `exampleFolder.test.ts`: keep them passing when you change a command or a doc.
