export const ASSET_EDIT_STATES = {
    EDITABLE: "EDITABLE",
    IN_USE: "IN_USE",
} as const;

export type AssetEditState =
    (typeof ASSET_EDIT_STATES)[keyof typeof ASSET_EDIT_STATES];

// An asset used by a map only accepts these.
export const IN_USE_EDITABLE_FIELDS = [
    "name",
    "promptText",
    "category",
] as const;
