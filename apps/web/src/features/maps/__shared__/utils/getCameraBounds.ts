import { TILE_SIZE } from "@standin/contracts";
import { EDITOR_CAMERA_CONFIG } from "@/features/maps/__shared__/consts/camera";

type Params = {
    mapWidth: number;
    mapHeight: number;
    viewWidth: number;
    viewHeight: number;
    zoom: number;
};

export type CameraBounds = {
    x: number;
    y: number;
    width: number;
    height: number;
};

const getAxis = (mapSize: number, viewSize: number, zoom: number) => {
    const margin = EDITOR_CAMERA_CONFIG.BOUNDS_MARGIN_TILES * TILE_SIZE;
    // Phaser pins the camera to the start of bounds smaller than the view. A
    // bound as large as the view, centered on the map, keeps the map in the middle.
    const size = Math.max(mapSize + margin * 2, viewSize / zoom);

    return { start: -(size - mapSize) / 2, size };
};

// The area the camera may show (world px): the map with a margin of tiles,
// grown to the size of the view when the map is smaller, so it stays centered.
export const getCameraBounds = ({
    mapWidth,
    mapHeight,
    viewWidth,
    viewHeight,
    zoom,
}: Params): CameraBounds => {
    const horizontal = getAxis(mapWidth, viewWidth, zoom);
    const vertical = getAxis(mapHeight, viewHeight, zoom);

    return {
        x: horizontal.start,
        y: vertical.start,
        width: horizontal.size,
        height: vertical.size,
    };
};
