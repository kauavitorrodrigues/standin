import { STAMP_LAYER_ORDER } from "../../consts/stamp-layer-order";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { Cell } from "../../types/cell";
import type { Stamp } from "../../types/stamp";

/**
 * One paint_tiles for each layer with content, with the cells grouped by the
 * palette tile that fills them. The stamp must have passed StampSchema.
 */
export const buildStampPaintOps = (
    stamp: Stamp,
    tileX: number,
    tileY: number
): EditorOp[] => {
    const ops: EditorOp[] = [];

    for (const layerName of STAMP_LAYER_ORDER) {
        const data = stamp.layers[layerName];
        if (!data) continue;

        const cellsByTile = new Map<number, Cell[]>();
        data.forEach((value, index) => {
            if (value === 0) return;

            const cell: Cell = [
                tileX + (index % stamp.width),
                tileY + Math.floor(index / stamp.width),
            ];
            cellsByTile.set(value, [...(cellsByTile.get(value) ?? []), cell]);
        });

        const tiles = [...cellsByTile].flatMap(([value, cells]) => {
            const entry = stamp.palette[value - 1];
            return entry ? [{ ...entry, cells }] : [];
        });

        if (tiles.length > 0) {
            ops.push({ type: "paint_tiles", layer: layerName, tiles });
        }
    }

    return ops;
};
