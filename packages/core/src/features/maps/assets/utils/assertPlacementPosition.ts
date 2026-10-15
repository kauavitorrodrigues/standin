import { ASSET_PLACEMENTS } from "@standin/contracts";
import type { AssetDef } from "../types/asset-def";
import type { Footprint } from "../types/footprint";
import type { Item } from "../types/item";
import type { MapInfo } from "../types/map-info";
import { assertGroundPosition } from "./assertGroundPosition";
import { assertSurfacePosition } from "./assertSurfacePosition";
import { assertWallPosition } from "./assertWallPosition";

/** The position rule that matches how the asset is placed. */
export const assertPlacementPosition = (
    asset: AssetDef,
    footprint: Footprint,
    map: MapInfo,
    items: Item[],
    parent: Item | null
) => {
    if (asset.placement === ASSET_PLACEMENTS.SURFACE) {
        assertSurfacePosition(
            footprint,
            parent!,
            items.filter((item) => item.parentId === parent!.rowId)
        );
        return;
    }

    if (asset.placement === ASSET_PLACEMENTS.WALL) {
        assertWallPosition(footprint, map);
        return;
    }

    assertGroundPosition(footprint, map, items);
};
