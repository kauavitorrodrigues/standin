import {
    BACKOFF_BASE_DELAY_MS,
    JITTER_MS,
    MAX_DELAY_MS,
} from "../consts/connection";

// Exponential backoff capped at MAX_DELAY_MS, plus a symmetric random jitter
// so peers that dropped together do not retry in lockstep.
export const backoffDelay = (attempt: number): number =>
    Math.min(BACKOFF_BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS) +
    (2 * Math.random() - 1) * JITTER_MS;
