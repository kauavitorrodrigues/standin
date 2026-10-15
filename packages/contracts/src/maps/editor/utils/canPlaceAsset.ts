import { ASSET_PLACEMENTS } from "../../../assets/enums/asset-placement";
import type { AssetDefinition } from "../../../assets/types";
import { LAYOUT_ISSUE_CODES as Code } from "../../layout/issues";
import type { CanPlaceAssetOptions } from "../types/can-place-asset-options";
import type { CanPlaceAssetResult } from "../types/can-place-asset-result";
import type { EditorModel } from "../types/editor-model";
import { isFootprintInsideMap } from "./isFootprintInsideMap";
import { checkGroundPlacement } from "./placement/checkGroundPlacement";
import { checkObjectLimit } from "./placement/checkObjectLimit";
import { checkSurfacePlacement } from "./placement/checkSurfacePlacement";
import { checkWallPlacement } from "./placement/checkWallPlacement";

/**
 * Whether an asset can sit with its footprint anchored at (tileX, tileY).
 * Bounds first, then the object limit, then the rule of the placement.
 */
export const canPlaceAsset = (
    model: EditorModel,
    asset: AssetDefinition,
    tileX: number,
    tileY: number,
    opts: CanPlaceAssetOptions = {}
): CanPlaceAssetResult => {
    const footprint = {
        tileX,
        tileY,
        width: asset.footprint.w,
        height: asset.footprint.h,
    };

    if (!isFootprintInsideMap(footprint, model)) {
        return { ok: false, reason: Code.CELL_OUT_OF_BOUNDS };
    }

    const limit = checkObjectLimit(model, opts.ignoreId);
    if (!limit.ok) return limit;

    switch (asset.placement) {
        case ASSET_PLACEMENTS.SURFACE:
            return checkSurfacePlacement(
                model,
                footprint,
                opts.parentId,
                opts.ignoreId
            );
        case ASSET_PLACEMENTS.WALL:
            return checkWallPlacement(model, footprint);
        default:
            return checkGroundPlacement(model, footprint, opts.ignoreId);
    }
};
