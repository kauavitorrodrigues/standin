export const SPACE_UNAVAILABLE_REASONS = {
    DUPLICATE_SESSION: "duplicate-session",
    LOADING: "loading",
    ERROR: "error",
    NOT_FOUND: "not-found",
} as const;

export type SpaceUnavailableReason =
    (typeof SPACE_UNAVAILABLE_REASONS)[keyof typeof SPACE_UNAVAILABLE_REASONS];

export const SPACE_AVAILABILITY_STATUS = {
    READY: "ready",
    UNAVAILABLE: "unavailable",
} as const;
