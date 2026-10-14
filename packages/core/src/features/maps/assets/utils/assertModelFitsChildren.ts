import {
    ASSET_PLACEMENTS,
    MapAssetModelTooSmallError,
    isFootprintInside,
    type Footprint,
} from "@standin/contracts";
import type { AssetDef } from "../types/asset-def";
import type { Item } from "../types/item";
import { acceptsSurfaceItems } from "./acceptsSurfaceItems";
import { itemFootprint } from "./itemFootprint";

/** Replacing a desk model: the items on top must still fit on the new one. */
export const assertModelFitsChildren = (
    nextAsset: AssetDef,
    footprint: Footprint,
    children: Item[]
) => {
    const surfaceChildren = children.filter(
        (child) => child.placement === ASSET_PLACEMENTS.SURFACE
    );
    if (surfaceChildren.length === 0) return;

    const fits =
        acceptsSurfaceItems(nextAsset.type) &&
        surfaceChildren.every((child) =>
            isFootprintInside(itemFootprint(child), footprint)
        );
    if (!fits) throw new MapAssetModelTooSmallError();
};
