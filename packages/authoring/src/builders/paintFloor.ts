import {
    LAYOUT_LAYER_NAMES,
    MAX_CELLS_PER_OP,
    chunkCells,
    rectCells,
} from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { checkOps } from "../internal/checkOps";
import { fail } from "../internal/fail";
import { createLibraryIndex } from "../library/createLibraryIndex";
import type { BuildResult, PaintFloorParams } from "../types";

/** Paints a rectangle of tiles, in blocks of at most MAX_CELLS_PER_OP cells. */
export const paintFloor = (
    model: EditorModel,
    { from, to, tileset, tileIndex, layer }: PaintFloorParams
): BuildResult => {
    const resolved = createLibraryIndex(model.library).tileset(tileset);
    if (!resolved.ok) return fail(resolved.issue);

    const ops: EditorOp[] = chunkCells(
        rectCells(from, to),
        MAX_CELLS_PER_OP
    ).map((cells) => ({
        type: "paint",
        layer: layer ?? LAYOUT_LAYER_NAMES.GROUND,
        tilesetId: resolved.value.id,
        tileIndex,
        cells,
    }));

    return checkOps(model, ops);
};
