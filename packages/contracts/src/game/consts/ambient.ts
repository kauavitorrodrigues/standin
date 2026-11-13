// Constants of the ambient ring: a quieter, wider band beyond the proximity
// ring where a person overhears the conversations nearby. Distances are in
// tiles (px / 32), never pixels.

// The names of the ranges as values, for the schema of the settings of a space
// and for the database enum.
export const AMBIENT_RANGES = {
    SHORT: "short",
    LONG: "long",
    OFF: "off",
} as const;

export type AmbientRange = (typeof AMBIENT_RANGES)[keyof typeof AMBIENT_RANGES];

// A space that never chose a range overhears at the short one.
export const DEFAULT_AMBIENT_RANGE: AmbientRange = AMBIENT_RANGES.SHORT;

// Width of the ring in tiles, added to the cutoff of the proximity preset.
// "off" has no ring.
export const AMBIENT_RING_TILES = {
    short: 4,
    long: 10,
    off: 0,
} as const satisfies Record<AmbientRange, number>;

// How far the ring falls, in dB, from its start to the outer edge of the range.
export const AMBIENT_FALLOFF_DB = 40;

// Share of the proximity volume at its edge that the ring starts at, so the
// ring is always quieter than the voice just inside the proximity ring.
export const AMBIENT_EDGE_SHARE = 0.5;

// How far inside the cutoff the proximity volume is read, in tiles.
export const AMBIENT_EDGE_PROBE_TILES = 0.01;
