export const CLICK_MOVE = {
    // Two releases inside this time, near each other on the screen, are a
    // double click.
    DOUBLE_CLICK_MS: 350,
    DOUBLE_CLICK_RADIUS_PX: 10,
} as const;

// The mark on the tile under the mouse and on the tile the avatar walks to.
export const TILE_CURSOR = {
    DEPTH: 689,
    CORNER_COLOR: 0x5a1212,
    CORNER_ALPHA: 1,
    CORNER_LINE_WIDTH: 2,
    // Length of each arm of a corner, and how far the corner sits inside the tile.
    CORNER_ARM_PX: 6,
    CORNER_INSET_PX: 2,
    FILL_COLOR: 0xffffff,
    FILL_ALPHA: 0.28,
} as const;

// The search for the way of a double click.
export const PATH_SEARCH = {
    // What a turn costs, in steps. A high value keeps the way to long straight
    // lines, with few turns, over a staircase of the same length.
    TURN_COST: 4,
    // Tiles looked at before giving up, so a goal out of reach cannot freeze.
    MAX_EXPANSIONS: 200000,
    // Times a blocked walk is planned again before it is dropped.
    MAX_REPLANS: 3,
    // Age after which the solids are read again for the mark under the mouse,
    // and for each move of a walk.
    HOVER_INDEX_MAX_AGE_MS: 250,
    WALK_INDEX_MAX_AGE_MS: 100,
} as const;

// Where the avatar may stand inside a tile. Its feet are on the center of the
// tile, which puts the body in the upper half of it, so a collision on the top
// of the tile (a wall, a table edge) can close a tile that has free floor
// under it. A tile whose center is closed offers these nearby points instead,
// the closest first, and is open when one of them fits. The body is narrower
// than a tile, so a few px to the sides are free too. Never lower than 12 px,
// so the feet stay inside the tile they belong to.
export const STAND_OFFSETS: readonly { x: number; y: number }[] = [
    { x: 0, y: 0 },
    { x: 0, y: 4 },
    { x: -4, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 8 },
    { x: -4, y: 4 },
    { x: 4, y: 4 },
    { x: 0, y: 12 },
    { x: -4, y: 8 },
    { x: 4, y: 8 },
    { x: -4, y: 12 },
    { x: 4, y: 12 },
];

// How many tiles of a clicked area are tried before giving up, best first.
export const AREA_GOALS_TRIED = 10;

// Looking for the tile next to a goal that is closed, like the Gather does.
export const NEAREST_TILE = {
    // Tiles tried along the direction the avatar faces.
    LINE_MAX: 100,
    // Tiles around the goal, in every direction, tried after that.
    GOAL_RADIUS: 4,
} as const;
