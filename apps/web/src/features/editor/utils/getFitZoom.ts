import { ZOOM_LEVELS, type ZoomLevel } from "@standin/contracts";

type Params = {
    mapWidth: number;
    mapHeight: number;
    viewWidth: number;
    viewHeight: number;
    // Screen px kept free on each side, for panels and breathing room.
    paddingX?: number;
    paddingY?: number;
};

// The largest zoom level where the whole map fits in the view (px). When not
// even the smallest level fits, it is the smallest level.
export const getFitZoom = ({
    mapWidth,
    mapHeight,
    viewWidth,
    viewHeight,
    paddingX = 0,
    paddingY = 0,
}: Params): ZoomLevel => {
    const fitting = ZOOM_LEVELS.filter(
        (level) =>
            mapWidth * level <= viewWidth - paddingX * 2 &&
            mapHeight * level <= viewHeight - paddingY * 2
    );

    return fitting[fitting.length - 1] ?? ZOOM_LEVELS[0];
};
