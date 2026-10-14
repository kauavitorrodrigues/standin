// The states the status badge can show.
export const EDITOR_STATUS_KIND = {
    CLEAN: "clean",
    DRAFT: "draft",
    PUBLISHING: "publishing",
    PUBLISHED: "published",
    ERROR: "error",
    LOCK_LOST: "lockLost",
} as const;
