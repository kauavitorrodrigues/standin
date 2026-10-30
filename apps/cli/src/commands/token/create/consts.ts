export const TOKEN_CREATE_COMMAND: string = "create";
// The name the JSON output uses.
export const TOKEN_CREATE_NAME: string = "token create";

export const TOKEN_CREATE_DESCRIPTION: string =
    "Create a service token. The token is shown once, in this result.";

export const TOKEN_CREATE_HELP: string = `
Scopes: library:read library:write maps:read maps:write templates:read
templates:write. Writing a resource does not let a token read it; a token that
authors maps needs maps:read, maps:write and library:read.

A token acts as the active admin that owns it: --admin <email> (or
ADMIN_EMAIL). Without either, the only active admin is used; with several
admins it is a usage error (exit 2) that lists them.

The token is printed once, in the result (result.token with --json), and is
never written to a log. Store it, or run \`standin login\` with it, right away.
--expires-at is an ISO 8601 UTC date, such as 2027-01-01T00:00:00Z.
--dry-run checks the input and prints the plan: the database is not read and
nothing is written.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin token create --name agent --scope maps:read maps:write library:read
  pnpm -s standin token create --name ci --scope library:read --expires-at 2027-01-01T00:00:00Z --json
  pnpm -s standin token create --name agent --scope maps:read --admin admin@example.com --dry-run`;

export const TOKEN_CREATE_MESSAGES = {
    created: (name: string, prefix: string, owner: string): string =>
        `✓ token created: ${name} (${prefix}), owned by ${owner}`,
    secret: (token: string): string =>
        `  token (shown only now, store it): ${token}`,
    valid: "✓ input is valid",
    plan: (name: string, scopes: string): string =>
        `  a real run creates the token "${name}" with the scopes ${scopes}`,
} as const;
