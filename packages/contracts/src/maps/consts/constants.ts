export const TILE_SIZE = 32;

// Per side, the absolute ceiling of any map.
export const MAX_MAP_TILES = 100;
export const MIN_MAP_TILES = { width: 12, height: 8 };

// Limit of the P2P audio mesh. Tiers that start above it are not enabled.
export const MAX_CAPACITY = 10;

// Cap on the serialized layout, besides the per tier dimension limit.
export const MAX_LAYOUT_BYTES = 1024 * 1024;

export const MAX_TILESETS_PER_MAP = 8;
export const MAX_ZONES_PER_MAP = 200;
export const MAX_OBJECTS_PER_MAP = 3000;
