// What to do about a domain error, by its code. The exit code stays the one
// of its status.
export const EXIT_HINTS_BY_CODE: Record<string, string> = {
    LIBRARY_SEED_ADMIN_NOT_FOUND:
        "Run `pnpm -s standin bootstrap --email <email>` first.",
    SERVICE_TOKEN_NOT_FOUND:
        "Run `pnpm -s standin token list` to see the ids of the tokens.",
    SERVICE_TOKEN_OWNER_INVALID:
        "Create another token with an active admin: `pnpm -s standin token create --name <name> --scope <scope> --admin <email>`, then `pnpm -s standin login`.",
    SERVICE_TOKEN_REVOKED:
        "Create a new token with `pnpm -s standin token create`, then `pnpm -s standin login`.",
    SERVICE_TOKEN_EXPIRED:
        "Create a new token with `pnpm -s standin token create`, then `pnpm -s standin login`.",
    MAP_LOCKED:
        "Wait until the editor closes the map and run the command again.",
    STALE_LAYOUT_VERSION:
        "The map changed. Run the command again without --base-version to use the current version.",
};

// For a 401 or 403 the server gave no hint for.
export const AUTH_FALLBACK_FIX: string =
    "Check the token (`pnpm -s standin login` or STANDIN_TOKEN) and that it has the scope the command needs.";

export const NOT_FOUND_FIX: string =
    "The map id or the URL is wrong; check that --url points at the API.";

export const UNAVAILABLE_FIX: string =
    "Check that the instance is running and that the URL is right (--url, STANDIN_URL or the URL saved by `standin login`), then try again.";

export const SCOPE_MISSING_CODE: string = "SERVICE_TOKEN_SCOPE_MISSING";
