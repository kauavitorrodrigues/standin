import {
    LAYOUT_ISSUE_CODES,
    MapAssetNotOnDeskTopError,
    MapAssetSurfaceOccupiedError,
    MapAssetSurfaceRequiredError,
    checkSurfacePlacement,
    type Footprint,
} from "@standin/contracts";
import type { Item } from "../types/item";
import { acceptsSurfaceItems } from "./acceptsSurfaceItems";
import { toPlacementModel } from "./toPlacementModel";

/**
 * SURFACE: the parent accepts items on top, the item sits inside the parent's
 * footprint, and no other SURFACE item of that parent uses the same cells. The
 * pure rule from the contracts answers both "not on top" cases with one reason,
 * so the routes keep their own error for a parent that takes no items.
 */
export const assertSurfacePosition = (
    footprint: Footprint,
    parent: Item,
    siblings: Item[]
) => {
    if (!acceptsSurfaceItems(parent.type)) {
        throw new MapAssetSurfaceRequiredError();
    }

    const result = checkSurfacePlacement(
        toPlacementModel([parent, ...siblings]),
        footprint,
        parent.rowId
    );
    if (result.ok) return;

    switch (result.reason) {
        case LAYOUT_ISSUE_CODES.FOOTPRINT_OVERLAP:
            throw new MapAssetSurfaceOccupiedError();
        default:
            throw new MapAssetNotOnDeskTopError();
    }
};
