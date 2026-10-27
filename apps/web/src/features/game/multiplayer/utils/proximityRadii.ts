import {
    PROXIMITY_PRESETS,
    TILE_SIZE,
    calculateProximityMagnitude,
    type ProximityPreset,
} from "@standin/contracts";
import { VIDEO_EXIT_MARGIN_PX } from "../consts/video";

export type ProximityRadii = {
    enterRadius: number;
    exitRadius: number;
};

/**
 * The reach of a preset in pixels. The enter radius is the cutoff of the
 * preset, the exit radius adds a margin so the stage does not flicker.
 */
export const getProximityRadii = (preset: ProximityPreset): ProximityRadii => {
    const enterRadius = PROXIMITY_PRESETS[preset].thresholdTiles * TILE_SIZE;
    return { enterRadius, exitRadius: enterRadius + VIDEO_EXIT_MARGIN_PX };
};

/**
 * The audio volume (0 to 1) of a remote person at a distance in pixels.
 * Silent at the cutoff of the preset and beyond, the curve decides before it.
 */
export const calculatePresetVolume = (
    preset: ProximityPreset,
    distance: number
): number => {
    const { enterRadius } = getProximityRadii(preset);
    if (!(distance < enterRadius)) return 0;

    return calculateProximityMagnitude(preset, distance / TILE_SIZE).audio;
};
