export const PUBLISH_MAX_ATTEMPTS = 3;

// Wait in ms before the next attempt, indexed by the attempt that just failed.
// It grows so a server that is restarting has time to come back.
export const PUBLISH_RETRY_DELAYS_MS = [1000, 3000] as const;

export const PUBLISH_SESSION_HEADER = "X-Editor-Session";

export const PUBLISH_ERROR_KIND = {
    VALIDATION: "validation",
    STALE: "stale",
    LOCK_LOST: "lockLost",
    RETRYABLE: "retryable",
    UNKNOWN: "unknown",
} as const;

export const PUBLISH_HTTP_STATUS = {
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    LOCKED: 423,
    SERVER_ERROR_FROM: 500,
} as const;

// How long the "Publicado" badge stays before it goes back to idle (ms).
export const PUBLISHED_BADGE_MS = 4000;

// From this share of MAX_PUBLISH_OPS the dialog suggests publishing (0 to 1).
export const PUBLISH_WARNING_RATIO = 0.8;

// What the publish dialog shows.
export const PUBLISH_DIALOG_MODE = {
    CONFIRM: "confirm",
    PUBLISHING: "publishing",
    VALIDATION: "validation",
    STALE: "stale",
    FAILED: "failed",
} as const;
