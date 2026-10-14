import {
    chunkCells,
    computeGid,
    findTileConflicts,
    toLayoutLibrary,
} from "@standin/contracts";
import type { Cell, EditorModel, LayerName } from "@standin/contracts";
import type { EditorBrush } from "@/features/maps/__shared__/types/editor-brush";
import type { TileGestureOps } from "@/features/maps/__shared__/types/tile-gesture-ops";
import { getCellGid } from "@/features/maps/__shared__/utils/getCellGid";

// The paint operations of a gesture. Cells that already hold the tile are left
// out (nothing to do), and so are the ones that conflict with an object. A
// gesture with more cells than one operation takes comes out as many
// operations.
export const buildPaintOps = (
    model: EditorModel,
    brush: EditorBrush,
    layer: LayerName,
    cells: readonly Cell[]
): TileGestureOps => {
    const gid = computeGid(
        model.layout,
        brush.tilesetId,
        brush.tileIndex,
        toLayoutLibrary(model.library, model.usedTilesets)
    );
    const changing = cells.filter(
        (cell) => getCellGid(model.layout, layer, cell) !== gid
    );
    const conflicts = findTileConflicts(model, {
        type: "paint",
        layer,
        tilesetId: brush.tilesetId,
        tileIndex: brush.tileIndex,
        cells: changing,
    });
    const blocked = new Set(
        conflicts.map(({ cell }) => `${cell[0]},${cell[1]}`)
    );
    const allowed = changing.filter(([x, y]) => !blocked.has(`${x},${y}`));

    return {
        conflicts,
        ops: chunkCells(allowed).map((chunk) => ({
            type: "paint",
            layer,
            tilesetId: brush.tilesetId,
            tileIndex: brush.tileIndex,
            cells: chunk,
        })),
    };
};
