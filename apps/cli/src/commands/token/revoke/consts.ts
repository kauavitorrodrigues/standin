export const TOKEN_REVOKE_COMMAND: string = "revoke";
// The name the JSON output uses.
export const TOKEN_REVOKE_NAME: string = "token revoke";
export const TOKEN_REVOKE_ACTION: string = "Revoking a token";

export const TOKEN_REVOKE_DESCRIPTION: string =
    "Revoke a service token for good. It stops working at once.";

export const TOKEN_REVOKE_HELP: string = `
From a terminal this asks for --yes (exit 2 without it), since a revoked token
cannot be brought back. Without a terminal (an agent, a script, CI) it never
asks and revokes. Revoking twice is fine, the first date is kept.
--dry-run says which token would be revoked and does not read or write the
database.

Examples:
  pnpm -s standin token revoke <id> --yes
  pnpm -s standin token revoke <id> --json
  pnpm -s standin token revoke <id> --dry-run`;

export const TOKEN_REVOKE_MESSAGES = {
    revoked: (name: string, prefix: string): string =>
        `✓ token revoked: ${name} (${prefix})`,
    plan: (id: string): string =>
        `  a real run revokes the token ${id}, if it exists`,
} as const;
