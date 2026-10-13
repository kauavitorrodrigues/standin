// Fields of an asset in use that may still change: maps already point at it,
// so nothing that shapes how it is drawn or placed can move.
export const IN_USE_EDITABLE_ASSET_FIELDS = [
    "name",
    "promptText",
    "category",
] as const;

// The three classes of field of a family (see the spec, section 4.1).
// Family fields are equal across the whole family, `animation` through its
// `frameDurationMs` and `repeat`.
export const FAMILY_ASSET_FIELDS = [
    "name",
    "category",
    "placement",
    "solid",
    "surfaceHeightPx",
    "action",
    "promptText",
] as const;

// Equal across the colors of the same rotation.
export const ROTATION_ASSET_FIELDS = ["footprint", "actionParams"] as const;

// Own to each row.
export const VARIATION_ASSET_FIELDS = ["rotation", "color"] as const;

export const ASSET_KEY_FALLBACK = "asset";
export const TILESET_KEY_FALLBACK = "tileset";
