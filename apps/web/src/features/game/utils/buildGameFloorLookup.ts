import {
    DEFAULT_FLOOR_MATERIAL,
    MapLayoutSchema,
    type FloorMaterial,
} from "@standin/contracts";
import { buildFloorMaterialLookup } from "@/features/game/utils/buildFloorMaterialLookup";
import type { GameMapData } from "@/features/game/types/tilemap";

type Point = { x: number; y: number };

/**
 * The floor lookup of the map the game runs. A map that comes without tile
 * meta (or whose layout does not read) is all wood, so the walk still sounds.
 */
export const buildGameFloorLookup = (
    map: GameMapData
): ((feet: Point) => FloorMaterial) => {
    const layout = MapLayoutSchema.safeParse(map.layout);
    if (!layout.success || !map.floorTilesets) {
        return () => DEFAULT_FLOOR_MATERIAL;
    }

    return buildFloorMaterialLookup(layout.data, map.floorTilesets);
};
