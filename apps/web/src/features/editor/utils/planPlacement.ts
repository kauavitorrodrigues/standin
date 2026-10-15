import {
    ASSET_PLACEMENTS,
    canPlaceAsset,
    LAYOUT_ISSUE_CODES,
    type AssetDefinition,
    type Cell,
    type EditorModel,
} from "@standin/contracts";
import type { PlacementResult } from "@/features/editor/types/PlacementReason";
import type { PlacementPlan } from "@/features/editor/types/PlacementPlan";
import { findSurfaceParent } from "@/features/editor/utils/findSurfaceParent";
import { planFreePosition } from "@/features/editor/utils/planFreePosition";
import {
    getDoorRefusal,
    type DoorRooms,
} from "@/features/editor/utils/getDoorRefusal";
import { snapToSurface } from "@/features/editor/utils/snapToSurface";

// The pointer in world px. Giving it places the object free, with the middle
// of the footprint under the pointer. Leaving it out snaps to the grid.
type FreePointer = { x: number; y: number };

// Decides where the asset goes for the cursor cell and whether it can, on the
// model as it is now (nothing is changed). The cell is the bottom left corner
// of the footprint. A SURFACE item snaps onto the top under the cursor and
// takes that object as its parent. With a free pointer the position is in
// pixels, and the cell it falls on is the anchor that the rules check. `rooms`
// replaces the zones of the model in the door rule (the area composer).
export const planPlacement = (
    model: EditorModel,
    assetId: string,
    cell: Cell,
    free?: FreePointer,
    rooms?: DoorRooms
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
                result: canPlaceAsset(
                    model,
                    asset,
                    anchor.tileX,
                    anchor.tileY,
                    {
                        parentId: parent.id,
                    }
                ),
            };
        }
    }

    const anchor = free ? planFreePosition(free, asset) : toGridAnchor(cell);
    return {
        asset,
        ...anchor,
        parentId: null,
        result: planGroundResult(model, asset, anchor, rooms),
    };
};

// The layout rules first, then the door rule: a door only stands on the
// border of a room.
const planGroundResult = (
    model: EditorModel,
    asset: AssetDefinition,
    anchor: ReturnType<typeof toGridAnchor>,
    rooms?: DoorRooms
): PlacementResult => {
    const result = canPlaceAsset(model, asset, anchor.tileX, anchor.tileY);
    if (!result.ok) return result;

    const refusal = getDoorRefusal(model, asset, anchor, rooms);
    if (refusal === null) return result;

    return { ok: false, reason: refusal };
};

const toGridAnchor = ([tileX, tileY]: Cell) => ({
    tileX,
    tileY,
    offsetX: 0,
    offsetY: 0,
});
