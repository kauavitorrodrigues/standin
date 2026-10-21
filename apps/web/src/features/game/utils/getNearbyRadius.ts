import {
    NEARBY_MAP_MAX_SHARE,
    NEARBY_RADIUS_MAX_PX,
    NEARBY_RADIUS_MIN_PX,
} from "@/features/game/consts/nearby";

// The reach of a nearby message in px: 12 tiles, shrinking on a small map down
// to 5 tiles.
export const getNearbyRadius = (
    mapWidthPx: number,
    mapHeightPx: number
): number => {
    const byMap = Math.min(mapWidthPx, mapHeightPx) * NEARBY_MAP_MAX_SHARE;

    return Math.min(
        Math.max(Math.min(NEARBY_RADIUS_MAX_PX, byMap), NEARBY_RADIUS_MIN_PX),
        NEARBY_RADIUS_MAX_PX
    );
};
