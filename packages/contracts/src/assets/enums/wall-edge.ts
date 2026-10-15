export const WALL_EDGES = {
    NORTH: "N",
    EAST: "E",
    SOUTH: "S",
    WEST: "W",
} as const;

export type WallEdge = (typeof WALL_EDGES)[keyof typeof WALL_EDGES];

export const WALL_EDGE_VALUES = [
    WALL_EDGES.NORTH,
    WALL_EDGES.EAST,
    WALL_EDGES.SOUTH,
    WALL_EDGES.WEST,
] as const;

// The pieces of a wall style, named by where they stand on the outline of a
// room seen from above. Each one draws the edges it lists: a side piece draws
// one edge and a corner piece draws two that meet.
export const WALL_PIECES = {
    N: "n",
    NE: "ne",
    E: "e",
    SE: "se",
    S: "s",
    SW: "sw",
    W: "w",
    NW: "nw",
} as const;

export type WallPiece = (typeof WALL_PIECES)[keyof typeof WALL_PIECES];

export const WALL_PIECE_EDGES: Record<WallPiece, readonly WallEdge[]> = {
    [WALL_PIECES.N]: [WALL_EDGES.NORTH],
    [WALL_PIECES.NE]: [WALL_EDGES.NORTH, WALL_EDGES.EAST],
    [WALL_PIECES.E]: [WALL_EDGES.EAST],
    [WALL_PIECES.SE]: [WALL_EDGES.SOUTH, WALL_EDGES.EAST],
    [WALL_PIECES.S]: [WALL_EDGES.SOUTH],
    [WALL_PIECES.SW]: [WALL_EDGES.SOUTH, WALL_EDGES.WEST],
    [WALL_PIECES.W]: [WALL_EDGES.WEST],
    [WALL_PIECES.NW]: [WALL_EDGES.NORTH, WALL_EDGES.WEST],
};
