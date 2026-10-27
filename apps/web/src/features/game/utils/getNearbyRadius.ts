import {
    PROXIMITY_PRESETS,
    TILE_SIZE,
    DEFAULT_PROXIMITY_PRESET,
    type ProximityPreset,
} from "@standin/contracts";
import {
    NEARBY_MAP_MAX_SHARE,
    NEARBY_RADIUS_MIN_PX,
} from "@/features/game/consts/nearby";

/**
 * The reach of a nearby message in px. It is the cutoff of the preset of the
 * space (12 tiles for Long, 5 for Short), shrinking on a small map down to 5
 * tiles, and never above the cutoff.
 */
export const getNearbyRadius = (
    mapWidthPx: number,
    mapHeightPx: number,
    preset: ProximityPreset = DEFAULT_PROXIMITY_PRESET
): number => {
    const maxPx = PROXIMITY_PRESETS[preset].thresholdTiles * TILE_SIZE;
    const byMap = Math.min(mapWidthPx, mapHeightPx) * NEARBY_MAP_MAX_SHARE;

    return Math.min(
        Math.max(Math.min(maxPx, byMap), NEARBY_RADIUS_MIN_PX),
        maxPx
    );
};
