export const TILE_SIZE = 32;

// Per side, the absolute ceiling of any map.
export const MAX_MAP_TILES = 100;
export const MIN_MAP_TILES = { width: 12, height: 8 };

// Most people one space holds, set by what one media worker can forward
// (about 500 streams, 6 per person). Tiers that start above it are not enabled.
// The number of videos each person sees at once is a separate limit, the
// carousel size of the subscription planner.
export const MAX_SPACE_CAPACITY = 80;

// Cap on the serialized layout, besides the per tier dimension limit.
export const MAX_LAYOUT_BYTES = 1024 * 1024;

export const MAX_TILESETS_PER_MAP = 8;
export const MAX_ZONES_PER_MAP = 200;
export const MAX_OBJECTS_PER_MAP = 3000;

// Pixel shift of an object from its anchor cell, in each axis. Stays under
// one cell so the anchor cell is still the one the object occupies.
export const MAX_OBJECT_OFFSET = TILE_SIZE - 1;
