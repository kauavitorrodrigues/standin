import type { Footprint } from "../types/footprint";
import type { FootprintBounds } from "../types/footprint-bounds";

export const isFootprintInsideMap = (
    footprint: Footprint,
    map: FootprintBounds
): boolean =>
    footprint.tileX >= 0 &&
    footprint.tileY < map.height &&
    footprint.tileX + footprint.width <= map.width &&
    footprint.tileY - footprint.height + 1 >= 0;
