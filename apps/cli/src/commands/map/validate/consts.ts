export const MAP_VALIDATE_COMMAND: string = "validate";
// The name the JSON output uses.
export const MAP_VALIDATE_NAME: string = "map validate";

export const MAP_VALIDATE_DESCRIPTION: string =
    "Check a map spec against a map of the instance: the schema, the library keys and the rules of the editor. Writes nothing. Needs a token with maps:read.";

export const MAP_VALIDATE_HELP: string = `
The spec is a YAML or JSON file (\`standin schema print spec\` prints its
format). It is read here, the map and its palette are read from the instance
and the spec is compiled to editor ops locally, the way an apply would.

Exit 0 when the spec builds on the map, exit 3 with the issues listed
({opIndex, code, path, message}) when it does not. A spec of kind "area" is
refused: it is a library entry, not the layout of a map.
--dry-run and --yes are accepted and have no effect, nothing is written.

Examples:
  pnpm -s standin map validate ./office.yaml --map <map-id>
  pnpm -s standin map validate ./office.yaml --map <map-id> --json
  STANDIN_URL=http://localhost:3001 STANDIN_TOKEN='<token>' pnpm -s standin map validate ./office.yaml --map <map-id>`;

export const MAP_VALIDATE_MESSAGES = {
    valid: (opCount: number, mapId: string, version: number): string =>
        `✓ the spec is valid: ${opCount} ops on map ${mapId} (layout version ${version})`,
} as const;
