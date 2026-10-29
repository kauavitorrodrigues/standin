// Spawns closer than this many tiles raise a warning.
export const SPAWN_MIN_DISTANCE_TILES = 2;

// A map keeps at least this many spawn zones, so there is always somewhere to
// put who enters it.
export const MIN_SPAWN_ZONES = 1;

// How far a thumbnail aspect ratio may drift from the map's before warning.
export const MAX_THUMBNAIL_ASPECT_DRIFT = 0.02;

// A polygon needs at least a triangle to enclose an area.
export const MIN_POLYGON_POINTS = 3;

// Gid of the first tile of the first tileset (gid 0 means empty).
export const FIRST_GID = 1;
