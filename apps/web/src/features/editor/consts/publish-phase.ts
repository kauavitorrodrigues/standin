// Phases of a publish as the status badge sees them.
export const PUBLISH_PHASE = {
    IDLE: "idle",
    PUBLISHING: "publishing",
    PUBLISHED: "published",
    ERROR: "error",
} as const;
