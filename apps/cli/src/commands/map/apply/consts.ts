export const MAP_APPLY_COMMAND: string = "apply";
// The name the JSON output uses.
export const MAP_APPLY_NAME: string = "map apply";

export const MAP_APPLY_DESCRIPTION: string =
    "Build a map spec on a map of the instance and apply it. Needs a token with maps:read and maps:write.";

export const MAP_APPLY_HELP: string = `
The spec is checked and compiled exactly like \`map validate\`, then the ops
are sent to POST /maps/<id>/apply. The server takes the lock of the map while
it applies and releases it. A map an editor has open answers 423 (exit 6).

--base-version is the layout version the spec was built on. Without it the
version read just before is used. A map that changed since answers 409 (exit 6)
with the current version.
--dry-run sends the ops with validateOnly: the server replays them and writes
nothing.
--yes is accepted and has no effect: this command never asks to confirm (it
is the agent flow; use --dry-run to check first).

Examples:
  pnpm -s standin map apply ./office.yaml --map <map-id> --dry-run
  pnpm -s standin map apply ./office.yaml --map <map-id>
  pnpm -s standin map apply ./office.yaml --map <map-id> --base-version 12 --json`;

export const MAP_APPLY_MESSAGES = {
    valid: (opCount: number, mapId: string): string =>
        `✓ the server accepts the ${opCount} ops for map ${mapId}`,
    dryRun: "  dry run: nothing was written",
    applied: (opCount: number, mapId: string, version: number): string =>
        `✓ applied ${opCount} ops to map ${mapId}: layout version ${version}`,
    objects: (used: number, max: number): string =>
        `  objects: ${used} of ${max}`,
} as const;
