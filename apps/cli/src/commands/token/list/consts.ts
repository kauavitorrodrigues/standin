export const TOKEN_LIST_COMMAND: string = "list";
// The name the JSON output uses.
export const TOKEN_LIST_NAME: string = "token list";

export const TOKEN_LIST_DESCRIPTION: string =
    "List the service tokens: prefix, name, scopes and status. The token itself is never shown.";

export const TOKEN_LIST_HELP: string = `
The status is active, revoked or expired. The id is what \`token revoke\` takes.
--dry-run and --yes are accepted and have no effect, nothing is written.

Examples:
  pnpm -s standin token list
  pnpm -s standin token list --json`;

export const TOKEN_LIST_MESSAGES = {
    row: (
        prefix: string,
        name: string,
        scopes: string,
        status: string,
        id: string
    ): string => `${prefix}  ${name}  [${scopes}]  ${status}  ${id}`,
    empty: "no service tokens",
} as const;
