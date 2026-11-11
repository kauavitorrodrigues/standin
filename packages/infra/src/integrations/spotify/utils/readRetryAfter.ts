export const RETRY_AFTER_HEADER = "retry-after";

/** The seconds of a `Retry-After` header, or null when it is missing or not a
 * whole number of seconds. */
export const readRetryAfter = (value: string | null): number | null => {
    if (value === null) return null;

    const seconds = Number(value);
    if (!Number.isInteger(seconds) || seconds < 0) return null;

    return seconds;
};
