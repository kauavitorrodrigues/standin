import {
    CLASSIC_DIST_THRESHOLD,
    LONG_AUDIO_DECAY_BASE,
    LONG_AUDIO_LINEAR_SLOPE,
    LONG_PLATEAU_TILES,
    LONG_VIDEO_DECAY_BASE,
    LONG_VIDEO_LINEAR_SLOPE,
    PROXIMITY_FLOOR,
    SHORT_AUDIO_DECAY_BASE,
    SHORT_PLATEAU_TILES,
    SHORT_VIDEO_DECAY_BASE,
} from "../consts/proximity";
import type { ProximityPreset } from "../consts/proximity";

export type ProximityMagnitude = { audio: number; video: number };

// Long preset. Never
// returns 0, so the DIST_THRESHOLD cutoff must be applied by the caller.
export function calculateLongMagnitude(tiles: number): ProximityMagnitude {
    if (tiles <= LONG_PLATEAU_TILES) {
        return {
            audio: 1 - LONG_AUDIO_LINEAR_SLOPE * tiles,
            video: 1 - tiles * LONG_VIDEO_LINEAR_SLOPE,
        };
    }

    const past = tiles - LONG_PLATEAU_TILES;
    const audioStart = 1 - LONG_AUDIO_LINEAR_SLOPE * LONG_PLATEAU_TILES;
    const videoStart = 1 - LONG_PLATEAU_TILES * LONG_VIDEO_LINEAR_SLOPE;

    return {
        audio: Math.max(audioStart / LONG_AUDIO_DECAY_BASE ** past, PROXIMITY_FLOOR),
        video: Math.max(videoStart / LONG_VIDEO_DECAY_BASE ** past, PROXIMITY_FLOOR),
    };
}

// Short (Classic) preset. Hard 0 from CLASSIC_DIST_THRESHOLD.
export function calculateShortMagnitude(tiles: number): ProximityMagnitude {
    if (tiles < SHORT_PLATEAU_TILES) {
        return { audio: 1, video: 1 };
    }

    if (tiles >= CLASSIC_DIST_THRESHOLD) {
        return { audio: 0, video: 0 };
    }

    const past = tiles - SHORT_PLATEAU_TILES;

    return {
        audio: 1 / SHORT_AUDIO_DECAY_BASE ** past,
        video: 1 / SHORT_VIDEO_DECAY_BASE ** past,
    };
}

export function calculateProximityMagnitude(
    preset: ProximityPreset,
    tiles: number,
): ProximityMagnitude {
    switch (preset) {
        case "Long":
            return calculateLongMagnitude(tiles);
        case "Short":
            return calculateShortMagnitude(tiles);
    }
}
