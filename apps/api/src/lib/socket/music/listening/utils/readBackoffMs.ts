import {
    LISTENING_DEFAULT_BACKOFF_MS,
    LISTENING_MAX_BACKOFF_MS,
} from "@standin/contracts";

/**
 * How long to leave an organization alone after a 429. The wait Spotify asked
 * for is respected, but never below a minimum when it sent none and never
 * above a cap, so a strange header cannot silence a space for hours.
 */
export const readBackoffMs = (retryAfterMs: number | null): number => {
    if (retryAfterMs === null) return LISTENING_DEFAULT_BACKOFF_MS;

    return Math.min(retryAfterMs, LISTENING_MAX_BACKOFF_MS);
};
