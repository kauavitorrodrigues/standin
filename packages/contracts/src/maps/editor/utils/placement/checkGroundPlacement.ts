import { ASSET_PLACEMENTS } from "../../../../assets/enums/asset-placement";
import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { CanPlaceAssetResult } from "../../types/can-place-asset-result";
import type { EditorModel } from "../../types/editor-model";
import type { Footprint } from "../../types/footprint";
import { TILE_SIZE } from "../../../consts/constants";
import { cellsOverlapAtShift } from "../cellsOverlap";
import { getOccupiedCells } from "../getOccupiedCells";
import { getOccupiedFineCells } from "../getOccupiedFineCells";
import { isSolidWallTile } from "./isSolidWallTile";
import { listPlacedWithAsset } from "./listPlacedWithAsset";
import { placedFootprint } from "./placedFootprint";

type PixelOffset = { x: number; y: number };

const NO_OFFSET: PixelOffset = { x: 0, y: 0 };

// The box of a footprint where it is drawn, in px.
const pixelBox = (footprint: Footprint, offset: PixelOffset) => {
    const left = footprint.tileX * TILE_SIZE + offset.x;
    const top = (footprint.tileY - footprint.height + 1) * TILE_SIZE + offset.y;
    return {
        left,
        top,
        right: left + footprint.width * TILE_SIZE,
        bottom: top + footprint.height * TILE_SIZE,
    };
};

const boxesOverlap = (
    a: ReturnType<typeof pixelBox>,
    b: ReturnType<typeof pixelBox>
): boolean =>
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * GROUND: no solid wall under the occupied tiles and no overlap with the
 * occupied cells of other GROUND objects. The overlap is told by the cells of
 * the masks, so two objects can share a tile the first one leaves free. Each
 * object counts where it is drawn, so its pixel offset moves its cells: the
 * `offset` is the one of the object being checked, the others carry theirs.
 */
export const checkGroundPlacement = (
    model: EditorModel,
    footprint: Footprint,
    ignoreId?: string,
    offset: PixelOffset = NO_OFFSET
): CanPlaceAssetResult => {
    const cells = getOccupiedCells(footprint);
    const blocked = cells.some(({ x, y }) => isSolidWallTile(model, x, y));
    if (blocked) return { ok: false, reason: Code.CELL_BLOCKED_BY_WALL };

    const fineCells = getOccupiedFineCells(footprint);
    const overlaps = listPlacedWithAsset(model, ignoreId).some(
        ({ placed, asset }) => {
            if (asset.placement !== ASSET_PLACEMENTS.GROUND) return false;
            const other = placedFootprint(placed, asset);
            const otherOffset = { x: placed.offsetX, y: placed.offsetY };
            return (
                boxesOverlap(
                    pixelBox(footprint, offset),
                    pixelBox(other, otherOffset)
                ) &&
                cellsOverlapAtShift(
                    fineCells,
                    getOccupiedFineCells(other),
                    {
                        x: offset.x - otherOffset.x,
                        y: offset.y - otherOffset.y,
                    }
                )
            );
        }
    );
    if (overlaps) return { ok: false, reason: Code.FOOTPRINT_OVERLAP };

    return { ok: true };
};
