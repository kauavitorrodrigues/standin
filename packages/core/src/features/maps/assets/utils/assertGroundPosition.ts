import {
    LAYOUT_ISSUE_CODES,
    MapAssetOutOfBoundsError,
    MapAssetPositionOccupiedError,
    checkGroundPlacement,
    isFootprintInsideMap,
    type Footprint,
} from "@standin/contracts";
import type { Item } from "../types/item";
import type { MapInfo } from "../types/map-info";
import { toPlacementModel } from "./toPlacementModel";

/**
 * GROUND: inside the map, and no overlap with other GROUND objects. The overlap
 * rule is the pure one from the contracts, its reason mapped to the route error.
 */
export const assertGroundPosition = (
    footprint: Footprint,
    map: MapInfo,
    others: Item[]
) => {
    if (!isFootprintInsideMap(footprint, map)) {
        throw new MapAssetOutOfBoundsError();
    }

    const result = checkGroundPlacement(
        toPlacementModel(others, map),
        footprint
    );
    if (result.ok) return;

    switch (result.reason) {
        case LAYOUT_ISSUE_CODES.FOOTPRINT_OVERLAP:
        default:
            throw new MapAssetPositionOccupiedError();
    }
};
