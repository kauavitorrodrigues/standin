export const LOGOUT_COMMAND: string = "logout";

export const LOGOUT_DESCRIPTION: string =
    "Delete the file written by `standin login`.";

export const LOGOUT_HELP: string = `
Safe to run again: with no file there is nothing to delete and it still
succeeds. The token itself stays valid on the server; revoke it with
\`standin token revoke\` if it must stop working.
--dry-run says which file would be deleted and deletes nothing.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin logout
  pnpm -s standin logout --json`;

export const LOGOUT_MESSAGES = {
    removed: (configPath: string): string => `✓ deleted ${configPath}`,
    nothing: (configPath: string): string =>
        `✓ not logged in (${configPath} does not exist)`,
    dryRun: (configPath: string): string =>
        `  dry run: ${configPath} was not touched`,
} as const;
