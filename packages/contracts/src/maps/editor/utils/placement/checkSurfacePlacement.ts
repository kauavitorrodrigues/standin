import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { SURFACE_TYPES } from "../../../../assets/enums/asset-type";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { CanPlaceAssetResult } from "../../types/can-place-asset-result";
import type { EditorModel } from "../../types/editor-model";
import type { Footprint } from "../../types/footprint";
import { footprintsOverlap } from "../footprintsOverlap";
import { isFootprintInside } from "../isFootprintInside";
import { listPlacedWithAsset } from "./listPlacedWithAsset";
import { placedFootprint } from "./placedFootprint";

/**
 * SURFACE: the parent accepts items on top, the item sits inside the parent
 * footprint and no other SURFACE item of that parent uses the same cells.
 */
export const checkSurfacePlacement = (
    model: EditorModel,
    footprint: Footprint,
    parentId: string | null | undefined,
    ignoreId?: string
): CanPlaceAssetResult => {
    const objects = listPlacedWithAsset(model, ignoreId);
    const parent = objects.find(({ placed }) => placed.id === parentId);
    const accepts =
        parent !== undefined &&
        (SURFACE_TYPES as readonly string[]).includes(parent.asset.type);
    if (!parent || !accepts) return { ok: false, reason: Code.NOT_ON_SURFACE };

    if (
        !isFootprintInside(
            footprint,
            placedFootprint(parent.placed, parent.asset)
        )
    ) {
        return { ok: false, reason: Code.NOT_ON_SURFACE };
    }

    const taken = objects.some(
        ({ placed, asset }) =>
            placed.parentId === parent.placed.id &&
            asset.placement === ASSET_PLACEMENTS.SURFACE &&
            footprintsOverlap(footprint, placedFootprint(placed, asset))
    );
    if (taken) return { ok: false, reason: Code.FOOTPRINT_OVERLAP };

    return { ok: true };
};
