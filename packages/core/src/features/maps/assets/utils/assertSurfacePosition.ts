import {
    ASSET_PLACEMENTS,
    MapAssetNotOnDeskTopError,
    MapAssetSurfaceOccupiedError,
    MapAssetSurfaceRequiredError,
} from "@standin/contracts";
import type { Footprint } from "../types/footprint";
import type { Item } from "../types/item";
import { acceptsSurfaceItems } from "./acceptsSurfaceItems";
import { footprintsOverlap } from "./footprintsOverlap";
import { isFootprintInside } from "./isFootprintInside";
import { itemFootprint } from "./itemFootprint";

/**
 * SURFACE: the parent accepts items on top, the item sits inside the parent's
 * footprint, and no other SURFACE item of that parent uses the same cells.
 */
export const assertSurfacePosition = (
    footprint: Footprint,
    parent: Item,
    siblings: Item[]
) => {
    if (!acceptsSurfaceItems(parent.type)) {
        throw new MapAssetSurfaceRequiredError();
    }
    if (!isFootprintInside(footprint, itemFootprint(parent))) {
        throw new MapAssetNotOnDeskTopError();
    }

    const taken = siblings.some(
        (sibling) =>
            sibling.placement === ASSET_PLACEMENTS.SURFACE &&
            footprintsOverlap(footprint, itemFootprint(sibling))
    );
    if (taken) throw new MapAssetSurfaceOccupiedError();
};
