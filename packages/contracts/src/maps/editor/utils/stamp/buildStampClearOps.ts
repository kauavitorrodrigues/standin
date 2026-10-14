import { findTileLayer } from "../../../layout/ops/findTileLayer";
import { STAMP_LAYER_ORDER } from "../../consts/stamp-layer-order";
import type { EditorOp } from "../../schemas/editorOp.schema";
import type { Cell } from "../../types/cell";
import type { EditorModel } from "../../types/editor-model";
import type { Stamp } from "../../types/stamp";

/**
 * One erase for each layer: the cells of the rectangle that hold something on
 * the map and are empty in the stamp. The rest of the rectangle is replaced by
 * the paint that follows. The rectangle must be inside the map.
 */
export const buildStampClearOps = (
    model: EditorModel,
    stamp: Stamp,
    tileX: number,
    tileY: number
): EditorOp[] => {
    const ops: EditorOp[] = [];

    for (const layerName of STAMP_LAYER_ORDER) {
        const layer = findTileLayer(model.layout, layerName);
        if (!layer) continue;

        const stampData = stamp.layers[layerName];
        const cells: Cell[] = [];

        for (let dy = 0; dy < stamp.height; dy++) {
            for (let dx = 0; dx < stamp.width; dx++) {
                if (stampData?.[dy * stamp.width + dx]) continue;

                const x = tileX + dx;
                const y = tileY + dy;
                if (layer.data[y * model.layout.width + x]) cells.push([x, y]);
            }
        }

        if (cells.length > 0) {
            ops.push({ type: "erase", layer: layerName, cells });
        }
    }

    return ops;
};
