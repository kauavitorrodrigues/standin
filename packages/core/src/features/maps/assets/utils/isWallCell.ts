import { LAYOUT_LAYER_NAMES, TILED_LAYER_TYPES } from "@standin/contracts";
import type { MapInfo } from "../types/map-info";

export const isWallCell = (map: MapInfo, x: number, y: number): boolean => {
    const walls = map.layout.layers.find(
        (layer) =>
            layer.type === TILED_LAYER_TYPES.TILE_LAYER &&
            layer.name === LAYOUT_LAYER_NAMES.WALLS
    );

    return (
        walls?.type === TILED_LAYER_TYPES.TILE_LAYER &&
        walls.data[y * map.width + x] !== 0
    );
};
