export const DELETE_MODES = {
    ALLOWED: "ALLOWED",
    BLOCKED: "BLOCKED",
} as const;

export type DeleteMode = (typeof DELETE_MODES)[keyof typeof DELETE_MODES];
