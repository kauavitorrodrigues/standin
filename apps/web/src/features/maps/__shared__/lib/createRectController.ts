import { rectCells } from "@standin/contracts";
import type { Cell } from "@standin/contracts";
import { TILE_PREVIEW_KINDS } from "@/features/maps/__shared__/consts/tilePreview";
import { TilePreview } from "@/features/maps/__shared__/lib/TilePreview";
import type { BrushTarget } from "@/features/maps/__shared__/types/brush-target";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { buildPaintOps } from "@/features/maps/__shared__/utils/buildPaintOps";
import { commitTileGesture } from "@/features/maps/__shared__/utils/commitTileGesture";
import { resolveBrushTarget } from "@/features/maps/__shared__/utils/resolveBrushTarget";

// The rectangle (R). Dragging shows the rectangle between the press and the
// pointer. Releasing sends ONE paint gesture with its cells.
export const createRectController = (env: ToolEnv): ToolController => {
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
            preview.set(rectCells(start, cell));
        },
        onPointerUp: (context) => {
            if (!start || !target) return;

            const gesture = buildPaintOps(
                context.model,
                target.brush,
                target.layer,
                rectCells(start, context.cell)
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
