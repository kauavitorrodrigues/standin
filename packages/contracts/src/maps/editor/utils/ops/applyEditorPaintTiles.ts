import type { EditorOp } from "../../schemas/editorOp.schema";
import type { CellDiff } from "../../types/cell-diff";
import type { EditorOpHandler } from "../../types/editor-op-handler";
import { applyEditorPaint } from "./applyEditorPaint";

/**
 * A paint for each item, in order, on the model the previous item returned.
 * The diffs are joined in that order and the inverse undoes the last item
 * first, so applying it in sequence gives the model back.
 */
export const applyEditorPaintTiles: EditorOpHandler<
    Extract<EditorOp, { type: "paint_tiles" }>
> = (model, op) => {
    let current = model;
    const diff: CellDiff[] = [];
    const inverseByItem: EditorOp[][] = [];

    for (const item of op.tiles) {
        const result = applyEditorPaint(current, {
            type: "paint",
            layer: op.layer,
            tilesetId: item.tilesetId,
            tileIndex: item.tileIndex,
            cells: item.cells,
        });
        if (!result.ok) return result;

        current = result.model;
        diff.push(...result.diff);
        inverseByItem.push(result.inverse);
    }

    return {
        ok: true,
        model: current,
        inverse: inverseByItem.reverse().flat(),
        diff,
    };
};
