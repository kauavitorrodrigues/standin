// The example of the help: a tree on a grid of 2 x 3 tiles of 64 px.
export const TREE_TILE_PX = 64;
export const TREE_WIDTH_PX = 2 * TREE_TILE_PX;
export const TREE_HEIGHT_PX = 3 * TREE_TILE_PX;

// Room around the drawing so the strokes on its edges are not cut by the
// edge of the svg.
export const TREE_PAD_PX = 2;

export const TREE_GRID_LINES = [TREE_TILE_PX, 2 * TREE_TILE_PX];

// A cell of the collision, and the cells the trunk fills in the example: two
// columns wide and four rows tall, from the top of the footprint.
export const TREE_CELL_PX = 8;
export const TREE_TRUNK_CELLS = {
    x: 56,
    y: 2 * TREE_TILE_PX,
    cols: 2,
    rows: 4,
};

// The tree is paler while the footprint or the collision is highlighted.
export const TREE_DIMMED_OPACITY = 0.45;
