export const DELETE_MODES = {
    ALONE: "ALONE",
    FAMILY: "FAMILY",
} as const;

export type DeleteMode = (typeof DELETE_MODES)[keyof typeof DELETE_MODES];
