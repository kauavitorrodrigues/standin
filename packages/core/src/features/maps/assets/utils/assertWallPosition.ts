import {
    MapAssetNotOnWallError,
    MapAssetOutOfBoundsError,
    isFootprintInsideMap,
    getOccupiedCells,
    type Footprint,
} from "@standin/contracts";
import type { MapInfo } from "../types/map-info";
import { isWallCell } from "./isWallCell";

/** WALL: inside the map, and the occupied cells over wall cells. */
export const assertWallPosition = (footprint: Footprint, map: MapInfo) => {
    if (!isFootprintInsideMap(footprint, map)) {
        throw new MapAssetOutOfBoundsError();
    }

    const onWall = getOccupiedCells(footprint).every(({ x, y }) =>
        isWallCell(map, x, y)
    );
    if (!onWall) throw new MapAssetNotOnWallError();
};
