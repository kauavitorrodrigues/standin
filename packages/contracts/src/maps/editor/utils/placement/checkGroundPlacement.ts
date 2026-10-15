import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { CanPlaceAssetResult } from "../../types/can-place-asset-result";
import type { EditorModel } from "../../types/editor-model";
import type { Footprint } from "../../types/footprint";
import { footprintsOverlap } from "../footprintsOverlap";
import { getFootprintCells } from "../getFootprintCells";
import { isSolidWallTile } from "./isSolidWallTile";
import { listPlacedWithAsset } from "./listPlacedWithAsset";
import { placedFootprint } from "./placedFootprint";

/** GROUND: no solid wall under the footprint and no overlap with other GROUND objects. */
export const checkGroundPlacement = (
    model: EditorModel,
    footprint: Footprint,
    ignoreId?: string
): CanPlaceAssetResult => {
    const blocked = getFootprintCells(footprint).some(({ x, y }) =>
        isSolidWallTile(model, x, y)
    );
    if (blocked) return { ok: false, reason: Code.CELL_BLOCKED_BY_WALL };

    const overlaps = listPlacedWithAsset(model, ignoreId).some(
        ({ placed, asset }) =>
            asset.placement === ASSET_PLACEMENTS.GROUND &&
            footprintsOverlap(footprint, placedFootprint(placed, asset))
    );
    if (overlaps) return { ok: false, reason: Code.FOOTPRINT_OVERLAP };

    return { ok: true };
};
