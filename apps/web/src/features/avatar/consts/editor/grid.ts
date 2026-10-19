// The parts grid of the editor: square tiles of one size, so the virtual list
// can place the rows without measuring images. The row holds as many tiles as
// the panel is wide enough for, up to the maximum.
export const PART_GRID_MAX_COLUMNS = 5;
export const PART_GRID_TILE_SIZE = 80;
export const PART_GRID_GAP = 8;
export const PART_GRID_ROW_HEIGHT = PART_GRID_TILE_SIZE + PART_GRID_GAP;

// How many rows past the visible ones stay mounted.
export const PART_GRID_OVERSCAN = 3;

// The category image beside the name, in px.
export const CATEGORY_IMAGE_SIZE = 32;
