import { floodFill } from "@standin/contracts";
import type { BrushTarget } from "@/features/maps/__shared__/types/brush-target";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { buildPaintOps } from "@/features/maps/__shared__/utils/buildPaintOps";
import { commitTileGesture } from "@/features/maps/__shared__/utils/commitTileGesture";
import { resolveBrushTarget } from "@/features/maps/__shared__/utils/resolveBrushTarget";

// The bucket (G). It fills, on release, the region of the cell with the same
// tile on the layer of the brush tile. A region over MAX_CELLS_PER_OP cells
// goes out as several operations of the SAME gesture, so it is one undo step.
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
            const region = floodFill(context.model.layout, layer, context.cell);
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
