const UNIQUE_VIOLATION = "23505";

const readCode = (value: unknown): unknown =>
    typeof value === "object" && value !== null && "code" in value
        ? value.code
        : undefined;

/**
 * True when Postgres refused a write for a unique index. Drizzle wraps the
 * driver error, so the code is also looked for in the cause.
 */
export const isUniqueViolation = (error: unknown): boolean => {
    if (readCode(error) === UNIQUE_VIOLATION) return true;
    if (typeof error !== "object" || error === null) return false;

    return "cause" in error && readCode(error.cause) === UNIQUE_VIOLATION;
};
