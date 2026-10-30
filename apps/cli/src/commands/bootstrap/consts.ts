export const BOOTSTRAP_COMMAND = "bootstrap";

export const BOOTSTRAP_DESCRIPTION =
    "Create the first admin and the first organization of a fresh instance. Safe to run again: nothing that exists is changed.";

export const BOOTSTRAP_HELP = `
Each value comes from its flag, or from the variable when the flag is not
given. Without a password one is generated and printed once, in the result.

  --email         ADMIN_EMAIL          required
  --password      ADMIN_PASSWORD       optional
  --name          ADMIN_NAME           default: Admin
  --organization  ORGANIZATION_NAME    default: Standin

Without a terminal a missing email is a usage error (exit 2), never a prompt.
--dry-run checks the input only: it does not read or write the database.
--yes is accepted and has no effect, this command never asks to confirm.

Examples:
  pnpm -s standin bootstrap --email admin@example.com
  pnpm -s standin bootstrap --email admin@example.com --organization "Acme" --json
  ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='a-strong-passphrase' pnpm -s standin bootstrap
  pnpm -s standin bootstrap --email admin@example.com --dry-run`;
