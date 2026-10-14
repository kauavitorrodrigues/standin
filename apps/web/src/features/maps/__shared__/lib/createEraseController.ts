import type { LayerName } from "@standin/contracts";
import { EDITOR_LAYERS } from "@/features/maps/__shared__/consts/layers";
import { ERASE_TARGETS } from "@/features/maps/__shared__/consts/erase-targets";
import { SELECTION_MESSAGES } from "@/features/maps/__shared__/consts/messages";
import { createObjectSelectionProvider } from "@/features/maps/__shared__/lib/createObjectSelectionProvider";
import { TILE_PREVIEW_KINDS } from "@/features/maps/__shared__/consts/tilePreview";
import { TilePreview } from "@/features/maps/__shared__/lib/TilePreview";
import { TileStroke } from "@/features/maps/__shared__/lib/TileStroke";
import type { ToolController } from "@/features/maps/__shared__/types/ToolController";
import type { ToolEnv } from "@/features/maps/__shared__/types/ToolEnv";
import { buildEraseOps } from "@/features/maps/__shared__/utils/buildEraseOps";
import { commitTileGesture } from "@/features/maps/__shared__/utils/commitTileGesture";
import { getEraseTarget } from "@/features/maps/__shared__/utils/getEraseTarget";
import { removeObjects } from "@/features/maps/__shared__/utils/removeObjects";
import type { ToolContext } from "@/features/maps/__shared__/types/ToolController";

// The eraser (E). With the Tiles tab open it erases in every layer that shows. Same
// gesture as the brush: the preview while dragging, ONE erase operation when
// the button goes up. With the Objects tab open a click removes the object
// under the pointer (a claimed desk asks for confirmation instead).
export const createEraseController = (env: ToolEnv): ToolController => {
    const preview = new TilePreview(env.scene, TILE_PREVIEW_KINDS.ERASE);
    let stroke: TileStroke | null = null;
    let layers: readonly LayerName[] = [];
    const objects = createObjectSelectionProvider(env);
    // What the press that is running erases, fixed when it starts.
    let target = getEraseTarget(env.store.getState().panelTab);

    const eraseObject = (context: ToolContext) => {
        const hit = objects.hitTest({
            model: context.model,
            worldX: context.worldX,
            worldY: context.worldY,
        });
        if (!hit) return;

        let held = false;
        const removed = removeObjects({
            host: { getModel: () => context.model, dispatch: context.dispatch },
            ids: [hit.id],
            onClaimedDesks: (ids) => {
                held = true;
                env.store.requestDeskRemoval(ids);
            },
        });
        if (!removed && !held) context.setHint(SELECTION_MESSAGES.ERASE_FAILED);
    };

    const reset = () => {
        stroke = null;
        layers = [];
        preview.clear();
    };

    return {
        onPointerDown: ({ cell, setHint }) => {
            setHint(null);
            target = getEraseTarget(env.store.getState().panelTab);
            if (target === ERASE_TARGETS.OBJECTS) return;
            const { layerVisibility } = env.store.getState();
            layers = EDITOR_LAYERS.filter((layer) => layerVisibility[layer]);
            stroke = new TileStroke(cell);
            preview.set([cell]);
        },
        onPointerMove: ({ cell }) => {
            if (!stroke) return;
            preview.add(stroke.extend(cell));
        },
        onPointerUp: (context) => {
            if (target === ERASE_TARGETS.OBJECTS) {
                eraseObject(context);
                return;
            }
            if (!stroke) return;

            stroke.extend(context.cell);
            const gesture = buildEraseOps(
                context.model,
                layers,
                stroke.getCells()
            );
            reset();
            commitTileGesture({ context, gesture, painting: null });
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
