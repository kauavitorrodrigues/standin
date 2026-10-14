import { SOLID_MASK_SUBDIVISION, TILE_SIZE } from "@standin/contracts";

// The side of a cell of the collision mask, in px of the image.
export const SOLID_CELL_PX = TILE_SIZE / SOLID_MASK_SUBDIVISION;

// A pixel counts as drawn from this alpha on (0 to 255).
export const SOLID_ALPHA_THRESHOLD = 32;

// A cell is solid when at least this share of its pixels is drawn.
export const SOLID_COVERAGE_MIN = 0.25;

// Pixels are read in groups of four: red, green, blue and alpha.
export const RGBA_CHANNELS = 4;
export const ALPHA_OFFSET = 3;
