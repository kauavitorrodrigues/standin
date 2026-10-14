import { chunkCells, findTileConflicts } from "@standin/contracts";
import type { Cell, EditorModel, LayerName } from "@standin/contracts";
import type { TileGestureOps } from "@/features/maps/__shared__/types/tile-gesture-ops";
import { getCellGid } from "@/features/maps/__shared__/utils/getCellGid";

const buildLayerErase = (
    model: EditorModel,
    layer: LayerName,
    cells: readonly Cell[]
): TileGestureOps => {
    const filled = cells.filter(
        (cell) => getCellGid(model.layout, layer, cell) !== 0
    );
    const conflicts = findTileConflicts(model, {
        type: "erase",
        layer,
        cells: filled,
    });
    const blocked = new Set(
        conflicts.map(({ cell }) => `${cell[0]},${cell[1]}`)
    );
    const allowed = filled.filter(([x, y]) => !blocked.has(`${x},${y}`));

    return {
        conflicts,
        ops: chunkCells(allowed).map((chunk) => ({
            type: "erase",
            layer,
            cells: chunk,
        })),
    };
};

// The erase operations of a gesture, in every layer given. Cells that are
// already empty in a layer are left out of it, and so are the ones that
// conflict with an object. A cell that conflicts in more than one layer is
// reported once.
export const buildEraseOps = (
    model: EditorModel,
    layers: readonly LayerName[],
    cells: readonly Cell[]
): TileGestureOps => {
    const perLayer = layers.map((layer) =>
        buildLayerErase(model, layer, cells)
    );
    const conflicts = new Map<string, TileGestureOps["conflicts"][number]>();
    for (const { conflicts: found } of perLayer) {
        for (const conflict of found) {
            conflicts.set(`${conflict.cell[0]},${conflict.cell[1]}`, conflict);
        }
    }

    return {
        conflicts: [...conflicts.values()],
        ops: perLayer.flatMap(({ ops }) => ops),
    };
};
