// What to do about a domain error, by its code. The exit code stays the one
// of its status.
export const EXIT_HINTS_BY_CODE: Record<string, string> = {
    LIBRARY_SEED_ADMIN_NOT_FOUND:
        "Run `pnpm -s standin bootstrap --email <email>` first.",
};
