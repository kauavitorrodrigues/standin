import {
    ASSET_PLACEMENTS,
    canPlaceAsset,
    LAYOUT_ISSUE_CODES,
    type Cell,
    type EditorModel,
} from "@standin/contracts";
import type { PlacementPlan } from "@/features/maps/__shared__/types/PlacementPlan";
import { findSurfaceParent } from "@/features/maps/__shared__/utils/findSurfaceParent";
import { planFreePosition } from "@/features/maps/__shared__/utils/planFreePosition";
import { snapToSurface } from "@/features/maps/__shared__/utils/snapToSurface";

// The pointer in world px. Giving it places the object free, with the middle
// of the footprint under the pointer. Leaving it out snaps to the grid.
type FreePointer = { x: number; y: number };

// Decides where the asset goes for the cursor cell and whether it can, on the
// model as it is now (nothing is changed). The cell is the bottom left corner
// of the footprint. A SURFACE item snaps onto the top under the cursor and
// takes that object as its parent. With a free pointer the position is in
// pixels, and the cell it falls on is the anchor that the rules check.
export const planPlacement = (
    model: EditorModel,
    assetId: string,
    cell: Cell,
    free?: FreePointer
): PlacementPlan => {
    const asset = model.library.assets.find(({ id }) => id === assetId);
    if (!asset) {
        return {
            asset: null,
            tileX: cell[0],
            tileY: cell[1],
            offsetX: 0,
            offsetY: 0,
            parentId: null,
            result: {
                ok: false,
                reason: LAYOUT_ISSUE_CODES.ASSET_NOT_IN_LIBRARY,
            },
        };
    }

    if (asset.placement === ASSET_PLACEMENTS.SURFACE) {
        const parent = findSurfaceParent(model, cell);
        const parentAsset = model.library.assets.find(
            ({ id }) => id === parent?.assetId
        );
        if (parent && parentAsset) {
            const anchor = free
                ? planFreePosition(free, asset, {
                      placed: parent,
                      asset: parentAsset,
                  })
                : toGridAnchor(snapToSurface(cell, asset, parent, parentAsset));
            return {
                asset,
                ...anchor,
                parentId: parent.id,
                result: canPlaceAsset(model, asset, anchor.tileX, anchor.tileY, {
                    parentId: parent.id,
                }),
            };
        }
    }

    const anchor = free
        ? planFreePosition(free, asset)
        : toGridAnchor(cell);
    return {
        asset,
        ...anchor,
        parentId: null,
        result: canPlaceAsset(model, asset, anchor.tileX, anchor.tileY),
    };
};

const toGridAnchor = ([tileX, tileY]: Cell) => ({
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
});
