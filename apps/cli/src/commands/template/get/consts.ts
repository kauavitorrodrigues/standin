export const TEMPLATE_GET_COMMAND: string = "get";
// The name the JSON output uses.
export const TEMPLATE_GET_NAME: string = "template get";

export const TEMPLATE_GET_DESCRIPTION: string =
    "Show one template: its status, size, map and thumbnail. Needs a token with the templates:read scope.";

export const TEMPLATE_GET_HELP: string = `
The result has the template as the API gives it, with the id of its map (the
one \`map validate\` and \`map apply\` take in --map). An id that does not exist
is exit 3.
--dry-run and --yes are accepted and have no effect, nothing is written.

Examples:
  pnpm -s standin template get <template-id>
  pnpm -s standin template get <template-id> --json`;
