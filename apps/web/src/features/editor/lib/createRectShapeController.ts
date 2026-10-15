import type { Cell } from "@standin/contracts";
import { TILE_PREVIEW_KINDS } from "@/features/editor/consts/tilePreview";
import { TilePreview } from "@/features/editor/lib/TilePreview";
import type { BrushTarget } from "@/features/editor/types/brush-target";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { buildPaintOps } from "@/features/editor/utils/buildPaintOps";
import { commitTileGesture } from "@/features/editor/utils/commitTileGesture";
import { resolveBrushTarget } from "@/features/editor/utils/resolveBrushTarget";

// A tool that paints a shape between two corners. Dragging shows the shape
// between the press and the pointer. Releasing sends ONE paint gesture with
// its cells. `getCells` says which cells the shape has.
export const createRectShapeController = (
    env: ToolEnv,
    getCells: (a: Cell, b: Cell) => Cell[]
): ToolController => {
    const preview = new TilePreview(env.scene, TILE_PREVIEW_KINDS.PAINT);
    let start: Cell | null = null;
    let last: Cell | null = null;
    let target: BrushTarget | null = null;

    const reset = () => {
        start = null;
        last = null;
        target = null;
        preview.clear();
    };

    return {
        onPointerDown: ({ cell, model, setHint }) => {
            target = resolveBrushTarget({
                brush: env.store.getState().brush,
                model,
                setHint,
            });
            if (!target) return;

            start = cell;
            last = cell;
            preview.set([cell]);
        },
        onPointerMove: ({ cell }) => {
            if (!start || !last) return;
            if (cell[0] === last[0] && cell[1] === last[1]) return;

            last = cell;
            preview.set(getCells(start, cell));
        },
        onPointerUp: (context) => {
            if (!start || !target) return;

            const gesture = buildPaintOps(
                context.model,
                target.brush,
                target.layer,
                getCells(start, context.cell)
            );
            const painting = target.brush.tilesetId;
            reset();
            commitTileGesture({ context, gesture, painting });
        },
        onCancel: () => {
            reset();
            env.setHint(null);
        },
        onDeactivate: () => {
            preview.destroy();
        },
    };
};
