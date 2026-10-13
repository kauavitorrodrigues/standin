export const TILE_ENTRY_EDIT_STATES = {
    FULL: "FULL",
    BLANK_DEFAULT_ONLY: "BLANK_DEFAULT_ONLY",
} as const;

export type TileEntryEditState =
    (typeof TILE_ENTRY_EDIT_STATES)[keyof typeof TILE_ENTRY_EDIT_STATES];
