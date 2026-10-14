import { floodFill } from "@standin/contracts";
import type { BrushTarget } from "@/features/editor/types/brush-target";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { buildPaintOps } from "@/features/editor/utils/buildPaintOps";
import { commitTileGesture } from "@/features/editor/utils/commitTileGesture";
import { resolveBrushTarget } from "@/features/editor/utils/resolveBrushTarget";

// The bucket (G). It fills, on release, the region of the cell with the same
// tile on the layer of the brush tile. A region over MAX_CELLS_PER_OP cells
// goes out as several operations of the SAME gesture, so it is one undo step.
// Inside the frame of an area it stays inside the frame.
export const createBucketController = (env: ToolEnv): ToolController => {
    let target: BrushTarget | null = null;

    return {
        onPointerDown: ({ model, setHint }) => {
            target = resolveBrushTarget({
                brush: env.store.getState().brush,
                model,
                setHint,
            });
        },
        onPointerUp: (context) => {
            if (!target) return;

            const { brush, layer } = target;
            target = null;
            const region = floodFill(
                context.model.layout,
                layer,
                context.cell,
                env.getBounds?.() ?? undefined
            );
            const gesture = buildPaintOps(context.model, brush, layer, region);
            commitTileGesture({
                context,
                gesture,
                painting: brush.tilesetId,
            });
        },
        onCancel: () => {
            target = null;
            env.setHint(null);
        },
    };
};
