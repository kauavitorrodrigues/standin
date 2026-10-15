import { LAYOUT_ISSUE_CODES as Code } from "../../../layout/issues";
import type { CanPlaceAssetResult } from "../../types/can-place-asset-result";
import type { EditorModel } from "../../types/editor-model";
import type { Footprint } from "../../types/footprint";
import { getFootprintCells } from "../getFootprintCells";
import { isWallTile } from "./isWallTile";

/** WALL: every cell of the footprint is over a wall tile. */
export const checkWallPlacement = (
    model: EditorModel,
    footprint: Footprint
): CanPlaceAssetResult => {
    const onWall = getFootprintCells(footprint).every(({ x, y }) =>
        isWallTile(model, x, y)
    );
    if (!onWall) return { ok: false, reason: Code.NOT_ON_WALL };

    return { ok: true };
};
