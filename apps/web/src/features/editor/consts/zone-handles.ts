// The 8 resize handles of an area: 4 corners and 4 edge middles. The corners
// come first so they win where two handles of a small area overlap.
export const ZONE_HANDLES = {
    NORTH_WEST: "nw",
    NORTH_EAST: "ne",
    SOUTH_EAST: "se",
    SOUTH_WEST: "sw",
    NORTH: "n",
    EAST: "e",
    SOUTH: "s",
    WEST: "w",
} as const;

export const ZONE_HANDLE_LIST = Object.values(ZONE_HANDLES);
