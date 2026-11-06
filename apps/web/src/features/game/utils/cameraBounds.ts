import { MAP_CAMERA_CONFIG } from "@/features/game/consts/camera";
import { MAP_LAYER_ORIGIN } from "@/features/game/consts/map-geometry";

export type CameraBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

/** The map with a margin on every side, which is how far the view can go. */
export const resolveCameraBounds = (
    mapWidth: number,
    mapHeight: number
): CameraBounds => {
    const marginX = mapWidth * MAP_CAMERA_CONFIG.OUTER_MARGIN_RATIO;
    const marginY = mapHeight * MAP_CAMERA_CONFIG.OUTER_MARGIN_RATIO;
    return {
        x: MAP_LAYER_ORIGIN.X - marginX,
        y: MAP_LAYER_ORIGIN.Y - marginY,
        width: mapWidth + marginX * 2,
        height: mapHeight + marginY * 2,
    };
};
