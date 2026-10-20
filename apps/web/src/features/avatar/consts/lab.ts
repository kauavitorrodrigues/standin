import { TILE_SIZE } from "@standin/contracts";

// Whole zooms only, so one px of art is always a whole number of screen px.
export const LAB_ZOOMS = [1, 2, 3, 4] as const;
export const LAB_DEFAULT_ZOOM = 2;

export const LAB_SCENE_TILES = { cols: 12, rows: 9 } as const;

// Where the pieces of the test scene stand, in tiles.
export const LAB_LAYOUT = {
    // The row of the wall. Its cap is the row above, over the avatars.
    WALL_ROW: 2,
    // The column of the door, a gap of one tile in the wall.
    DOOR_COL: 5,
    TABLE: { col: 1, row: 5, cols: 2 },
    CHAIR: { col: 8, row: 5 },
} as const;

// The seat of the chair, from the bottom left corner of its tile, the same
// way the seat editor stores it.
export const LAB_SEAT = { dx: TILE_SIZE / 2, dy: TILE_SIZE / 4 } as const;

// The solid mask of a wall tile is a grid of 4 x 4, so the ruler marks it.
export const LAB_RULER_MINOR_STEP_PX = TILE_SIZE / 4;

// Stacking of what is not an avatar, on the same scale as the feet of the
// avatars: an object follows its bottom edge, a cap is over everything and a
// seated avatar is over everything but the caps.
export const LAB_DEPTH = {
    SEATED: 5000,
    CAP: 10000,
    GUIDES: 20000,
} as const;
