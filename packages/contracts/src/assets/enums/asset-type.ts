export const ASSET_TYPES = {
    CHAIR: "CHAIR",
    TABLE: "TABLE",
    DESK: "DESK",
    SOFA: "SOFA",
    TV: "TV",
    MONITOR: "MONITOR",
    TREE: "TREE",
    PLANT: "PLANT",
    RUG: "RUG",
    POSTER: "POSTER",
    DOOR: "DOOR",
    WINDOW: "WINDOW",
    DECORATION: "DECORATION",
} as const;

// Types that accept SURFACE assets on top of them.
export const SURFACE_TYPES = [ASSET_TYPES.TABLE, ASSET_TYPES.DESK] as const;

// Types drawn below every avatar instead of sorted by Y.
export const BELOW_AVATAR_TYPES = [ASSET_TYPES.RUG] as const;
