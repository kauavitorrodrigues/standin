// Phases of the editor lock as the client sees them.
export const LOCK_STATUS = {
    ACQUIRING: "acquiring",
    HELD: "held",
    DENIED: "denied",
    LOST: "lost",
} as const;
