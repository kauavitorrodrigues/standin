import type { Footprint } from "../types/footprint";
import type { MapSize } from "../types/map-size";

export const isFootprintInsideMap = (
    footprint: Footprint,
    map: MapSize
): boolean =>
    footprint.tileX >= 0 &&
    footprint.tileY < map.height &&
    footprint.tileX + footprint.width <= map.width &&
    footprint.tileY - footprint.height + 1 >= 0;
