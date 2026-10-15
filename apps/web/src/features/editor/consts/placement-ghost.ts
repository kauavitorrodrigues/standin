// How the ghost of the object being placed looks. It draws above the placed
// objects and below the grid.
export const PLACEMENT_GHOST = {
    DEPTH: 800,
    VALID_ALPHA: 0.7,
    INVALID_ALPHA: 0.6,
    INVALID_TINT: 0xff4040,
    VALID_PLACEHOLDER_COLOR: 0x55dd77,
    INVALID_PLACEHOLDER_COLOR: 0xff4040,
    PLACEHOLDER_FILL_ALPHA: 0.4,
    PLACEHOLDER_STROKE_ALPHA: 0.9,
    PLACEHOLDER_STROKE_WIDTH: 1,
} as const;
