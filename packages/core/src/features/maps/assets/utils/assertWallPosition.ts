import {
    MapAssetNotOnWallError,
    MapAssetOutOfBoundsError,
} from "@standin/contracts";
import type { Footprint } from "../types/footprint";
import type { MapInfo } from "../types/map-info";
import { getFootprintCells } from "./getFootprintCells";
import { isFootprintInsideMap } from "./isFootprintInsideMap";
import { isWallCell } from "./isWallCell";

/** WALL: inside the map, and over wall cells. */
export const assertWallPosition = (footprint: Footprint, map: MapInfo) => {
    if (!isFootprintInsideMap(footprint, map)) {
        throw new MapAssetOutOfBoundsError();
    }

    const onWall = getFootprintCells(footprint).every(({ x, y }) =>
        isWallCell(map, x, y)
    );
    if (!onWall) throw new MapAssetNotOnWallError();
};
