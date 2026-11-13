import { AMBIENT_RANGES, getAmbientBand } from "@standin/contracts";
import type { AmbientRange, ProximityPreset } from "@standin/contracts";
import { PX_PER_TILE, RADIUS_HYSTERESIS_PX } from "../../consts/planner";
import type { PresetRadii } from "./radiiForPreset";

/**
 * The outer reach of the ambient ring in pixels, with the same exit margin as
 * the proximity ring. A range that is off has no reach, so both are 0.
 *
 * @param preset The proximity preset of the space, where the ring starts.
 * @param range The ambient range of the space.
 * @param pxPerTile Pixels in one tile, 32 by default.
 */
export const ambientRadii = (
    preset: ProximityPreset,
    range: AmbientRange,
    pxPerTile: number = PX_PER_TILE
): PresetRadii => {
    if (range === AMBIENT_RANGES.OFF) return { enterRadius: 0, exitRadius: 0 };

    const enterRadius = getAmbientBand(preset, range).outerTiles * pxPerTile;
    return { enterRadius, exitRadius: enterRadius + RADIUS_HYSTERESIS_PX };
};
