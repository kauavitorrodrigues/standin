import { TILE_PREVIEW_KINDS } from "@/features/maps/__shared__/consts/tilePreview";
import { TilePreview } from "@/features/maps/__shared__/lib/TilePreview";
import { TileStroke } from "@/features/maps/__shared__/lib/TileStroke";
import type { BrushTarget } from "@/features/maps/__shared__/types/brush-target";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { buildPaintOps } from "@/features/maps/__shared__/utils/buildPaintOps";
import { commitTileGesture } from "@/features/maps/__shared__/utils/commitTileGesture";
import { pickTileAt } from "@/features/maps/__shared__/utils/pickTileAt";
import { resolveBrushTarget } from "@/features/maps/__shared__/utils/resolveBrushTarget";

// The brush (P). Dragging collects the cells and shows them in the preview.
// Nothing reaches the draft until the button goes up, and then it is ONE
// paint gesture. Alt makes it the eyedropper for that press.
export const createBrushController = (env: ToolEnv): ToolController => {
    const preview = new TilePreview(env.scene, TILE_PREVIEW_KINDS.PAINT);
    let stroke: TileStroke | null = null;
    let target: BrushTarget | null = null;

    const reset = () => {
        stroke = null;
        target = null;
        preview.clear();
    };

    return {
        onPointerDown: ({ cell, alt, model, setHint }) => {
            if (alt) {
                pickTileAt(env.store, model, cell);
                return;
            }

            target = resolveBrushTarget({
                brush: env.store.getState().brush,
                model,
                setHint,
            });
            if (!target) return;

            stroke = new TileStroke(cell);
            preview.set([cell]);
        },
        onPointerMove: ({ cell }) => {
            if (!stroke) return;
            preview.add(stroke.extend(cell));
        },
        onPointerUp: (context) => {
            if (!stroke || !target) return;

            stroke.extend(context.cell);
            const gesture = buildPaintOps(
                context.model,
                target.brush,
                target.layer,
                stroke.getCells()
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
