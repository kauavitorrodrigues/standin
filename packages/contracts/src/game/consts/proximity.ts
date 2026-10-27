// Constants of the proximity audio and video curves.
// All distances are in tiles (px / 32), never pixels.

// Tiles at full strength before the Long curve starts decaying.
export const LONG_PLATEAU_TILES = 5;

// Tiles at full strength before the Short (Classic) curve starts decaying.
export const SHORT_PLATEAU_TILES = 2;

// The Long curve never reaches 0, it stops at this floor. The hard cutoff
// is applied outside the curve, with the thresholds below.
export const PROXIMITY_FLOOR = 0.1;

// Hard cutoff in tiles for the Long preset.
export const DIST_THRESHOLD = 12;

// Hard cutoff in tiles for the Short preset. The Short curve is 0 from here.
export const CLASSIC_DIST_THRESHOLD = 5;

export const LONG_AUDIO_LINEAR_SLOPE = 0.1;
export const LONG_VIDEO_LINEAR_SLOPE = 1 / 15;
export const LONG_AUDIO_DECAY_BASE = 1.485;
export const LONG_VIDEO_DECAY_BASE = 1.5;
export const SHORT_AUDIO_DECAY_BASE = 1.5;
export const SHORT_VIDEO_DECAY_BASE = 2;

export const PROXIMITY_PRESETS = {
    Long: {
        plateauTiles: LONG_PLATEAU_TILES,
        thresholdTiles: DIST_THRESHOLD,
    },
    Short: {
        plateauTiles: SHORT_PLATEAU_TILES,
        thresholdTiles: CLASSIC_DIST_THRESHOLD,
    },
} as const;

export type ProximityPreset = keyof typeof PROXIMITY_PRESETS;

// The names of the presets as values, for the schema of the settings of a space
// and for the database enum.
export const SPACE_PROXIMITY_PRESETS = {
    SHORT: "Short",
    LONG: "Long",
} as const;

// A space that never chose a preset hears at the Long reach.
export const DEFAULT_PROXIMITY_PRESET: ProximityPreset = "Long";
