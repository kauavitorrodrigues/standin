import { PROXIMITY_PRESETS } from "@standin/contracts";
import type { ProximityPreset } from "@standin/contracts";
import { PX_PER_TILE, RADIUS_HYSTERESIS_PX } from "../../consts/planner";

export type PresetRadii = {
    enterRadius: number;
    exitRadius: number;
};

/**
 * The reach of a proximity preset in pixels. A person is picked up inside the
 * enter radius, which is the hard cutoff of the preset, and only dropped
 * beyond the exit radius, a fixed margin further out. Audio and video share
 * the same radii.
 *
 * @param preset The proximity preset of the space.
 * @param pxPerTile Pixels in one tile, 32 by default.
 */
export const radiiForPreset = (
    preset: ProximityPreset,
    pxPerTile: number = PX_PER_TILE
): PresetRadii => {
    const enterRadius = PROXIMITY_PRESETS[preset].thresholdTiles * pxPerTile;
    return {
        enterRadius,
        exitRadius: enterRadius + RADIUS_HYSTERESIS_PX,
    };
};
