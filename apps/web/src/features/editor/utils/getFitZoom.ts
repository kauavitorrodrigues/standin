import { ZOOM_LEVELS, type ZoomLevel } from "@standin/contracts";

type Params = {
    mapWidth: number;
    mapHeight: number;
    viewWidth: number;
    viewHeight: number;
};

// The largest zoom level where the whole map fits in the view (px). When not
// even the smallest level fits, it is the smallest level.
export const getFitZoom = ({
    mapWidth,
    mapHeight,
    viewWidth,
    viewHeight,
}: Params): ZoomLevel => {
    const fitting = ZOOM_LEVELS.filter(
        (level) =>
            mapWidth * level <= viewWidth && mapHeight * level <= viewHeight
    );

    return fitting[fitting.length - 1] ?? ZOOM_LEVELS[0];
};
