import { getFamilyId } from "../../../assets/utils/assetFamily";
import type { AssetDefinition } from "../../../assets/types";
import { LAYOUT_ISSUE_CODES as Code } from "../../layout/issues";
import type { PlacedAsset } from "../../render/render-payload.schema";
import { REPLACE_INCOMPATIBLE_DETAILS as Detail } from "../consts/replace-incompatible-details";
import type { CanReplaceAssetResult } from "../types/can-replace-asset-result";
import type { EditorModel } from "../types/editor-model";
import type { ReplaceIncompatibleDetail } from "../types/replace-incompatible-detail";
import { cellsInside } from "./cellsOverlap";
import { getOccupiedCells } from "./getOccupiedCells";
import { canPlaceAsset } from "./canPlaceAsset";
import { listPlacedWithAsset } from "./placement/listPlacedWithAsset";
import { placedFootprint } from "./placement/placedFootprint";
import { ASSET_PLACEMENTS } from "../../../assets/enums/asset-placement";

// The bottom left cell the new asset is anchored at.
export type ReplaceAnchor = { tileX: number; tileY: number };

const refuse = (detail: ReplaceIncompatibleDetail): CanReplaceAssetResult => ({
    ok: false,
    reason: Code.REPLACE_INCOMPATIBLE,
    detail,
});

// Same family: another color (same rotation) or another rotation. Another
// family: a model, which must share category, type and placement.
const checkKind = (
    current: AssetDefinition,
    target: AssetDefinition
): ReplaceIncompatibleDetail | null => {
    if (current.id === target.id) return Detail.SAME_ASSET;

    if (getFamilyId(current) === getFamilyId(target)) {
        const sameRotation = current.rotation === target.rotation;
        const sameColor = current.colorKey === target.colorKey;
        return sameRotation && sameColor ? Detail.NOT_A_VARIANT : null;
    }

    if (current.category !== target.category) return Detail.DIFFERENT_CATEGORY;
    if (current.type !== target.type) return Detail.DIFFERENT_TYPE;
    if (current.placement !== target.placement) {
        return Detail.DIFFERENT_PLACEMENT;
    }
    return null;
};

/**
 * Whether a placed object can be swapped for another asset: a color,
 * a rotation or a model, with the new footprint fitting around the same
 * anchor (the bottom left cell) and the SURFACE children staying inside it.
 * The desk link is not checked here, the model does not know claimed desks.
 */
export const canReplaceAsset = (
    model: EditorModel,
    placed: PlacedAsset,
    targetAsset: AssetDefinition,
    anchor: ReplaceAnchor = placed
): CanReplaceAssetResult => {
    const current = model.library.assets.find(
        ({ id }) => id === placed.assetId
    );
    if (!current) return refuse(Detail.CURRENT_ASSET_UNKNOWN);

    const kind = checkKind(current, targetAsset);
    if (kind) return refuse(kind);

    const fit = canPlaceAsset(model, targetAsset, anchor.tileX, anchor.tileY, {
        parentId: placed.parentId,
        ignoreId: placed.id,
    });
    if (!fit.ok) return refuse(fit.reason);

    const footprint = {
        tileX: anchor.tileX,
        tileY: anchor.tileY,
        width: targetAsset.footprint.w,
        height: targetAsset.footprint.h,
        mask: targetAsset.footprint.mask ?? null,
    };
    const childOutside = listPlacedWithAsset(model).some(
        (child) =>
            child.placed.parentId === placed.id &&
            child.asset.placement === ASSET_PLACEMENTS.SURFACE &&
            !cellsInside(
                getOccupiedCells(placedFootprint(child.placed, child.asset)),
                getOccupiedCells(footprint)
            )
    );
    if (childOutside) return refuse(Detail.CHILD_OUTSIDE_FOOTPRINT);

    return { ok: true };
};
