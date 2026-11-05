// What a floor sounds like under the feet. Stored on the tileset.
export const FLOOR_MATERIALS = {
    CARPET: "CARPET",
    WOOD: "WOOD",
    STONE: "STONE",
    GRASS: "GRASS",
} as const;

// Used when a tileset has no material set.
export const DEFAULT_FLOOR_MATERIAL = FLOOR_MATERIALS.WOOD;
