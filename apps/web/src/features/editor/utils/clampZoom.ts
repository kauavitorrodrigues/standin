import { ZOOM_LEVELS } from "@standin/contracts";
import { roundZoom } from "@/utils/roundZoom";

// Keeps a zoom between the first and the last level, in whole percents.
export const clampZoom = (zoom: number): number =>
    roundZoom(
        Math.min(
            Math.max(zoom, ZOOM_LEVELS[0]),
            ZOOM_LEVELS[ZOOM_LEVELS.length - 1]!
        )
    );
