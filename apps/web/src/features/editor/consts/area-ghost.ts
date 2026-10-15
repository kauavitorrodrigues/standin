// How the ghost of the area being placed looks. It draws above the placed
// objects and below the grid, like the ghost of an object.
export const AREA_GHOST = {
    DEPTH: 800,
    ALPHA: 0.45,
    OUTLINE_WIDTH: 2,
    OUTLINE_ALPHA: 0.95,
    VALID_COLOR: 0x55dd77,
    INVALID_COLOR: 0xff4040,
    TEXTURE_PREFIX: "area-thumb",
} as const;
