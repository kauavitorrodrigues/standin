// Same colors on the rectangles of the editor and on the rows that describe
// them in the summary.
export const CROP_COLOR = "var(--primary)";
export const FOOTPRINT_COLOR = "#EF4444";
// The collision is a different color from the footprint, since it sits inside
// it and the two are easy to take for one.
export const COLLISION_COLOR = "#22C55E";
export const IMAGE_COLOR = "#A855F7";
export const NAME_COLOR = "#F59E0B";
export const GRID_LINE_COLOR = "rgba(255, 255, 255, 0.28)";

// The checkerboard behind the image, so transparent areas read as such.
export const CHECKER_DARK = "#1a1a1a";
export const CHECKER_LIGHT = "#242424";

// The 8 px cells of the collision painter, finer than the grid of the tiles.
export const SOLID_GRID_LINE_COLOR = "rgba(255, 255, 255, 0.14)";
