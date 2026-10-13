import {
    ASSET_PLACEMENTS,
    MapAssetOutOfBoundsError,
    MapAssetPositionOccupiedError,
} from "@standin/contracts";
import type { Footprint } from "../types/footprint";
import type { Item } from "../types/item";
import type { MapInfo } from "../types/map-info";
import { footprintsOverlap } from "./footprintsOverlap";
import { isFootprintInsideMap } from "./isFootprintInsideMap";
import { itemFootprint } from "./itemFootprint";

/** GROUND: inside the map, and no overlap with other GROUND objects. */
export const assertGroundPosition = (
    footprint: Footprint,
    map: MapInfo,
    others: Item[]
) => {
    if (!isFootprintInsideMap(footprint, map)) {
        throw new MapAssetOutOfBoundsError();
    }

    const blocked = others.some(
        (other) =>
            other.placement === ASSET_PLACEMENTS.GROUND &&
            footprintsOverlap(footprint, itemFootprint(other))
    );
    if (blocked) throw new MapAssetPositionOccupiedError();
};
