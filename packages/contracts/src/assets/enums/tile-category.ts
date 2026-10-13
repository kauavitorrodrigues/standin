export const TILE_CATEGORIES = {
    FLOOR: "FLOOR",
    WALL: "WALL",
    CEILING: "CEILING",
    DECORATION: "DECORATION",
    // A transparent tile. It has no layer, so a map never paints it.
    EMPTY: "EMPTY",
} as const;

export const SEAT_FACINGS = {
    UP: "UP",
    DOWN: "DOWN",
    LEFT: "LEFT",
    RIGHT: "RIGHT",
} as const;
