import type { Cell, LayerName } from "@standin/contracts";
import { EDITOR_LAYERS } from "@/features/editor/consts/layers";
import { ERASE_TARGETS } from "@/features/editor/consts/erase-targets";
import { SELECTION_MESSAGES } from "@/features/editor/consts/messages";
import { createObjectSelectionProvider } from "@/features/editor/lib/createObjectSelectionProvider";
import { ErasePreview } from "@/features/editor/lib/ErasePreview";
import { TileStroke } from "@/features/editor/lib/TileStroke";
import type { ToolController } from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { buildEraseOps } from "@/features/editor/utils/buildEraseOps";
import { commitTileGesture } from "@/features/editor/utils/commitTileGesture";
import { getEraseCells } from "@/features/editor/utils/getEraseCells";
import { getEraseTarget } from "@/features/editor/utils/getEraseTarget";
import { removeObjects } from "@/features/editor/utils/removeObjects";
import type { ToolContext } from "@/features/editor/types/ToolController";

// The eraser (E). With the Tiles tab open it erases in every layer that shows.
// Same gesture as the brush: the preview while dragging, ONE erase operation
// when the button goes up. Holding Shift while dragging erases the whole
// rectangle between the press and the pointer instead of the path. With the
// Objects tab open a click removes the object under the pointer (a claimed
// desk asks for confirmation instead).
export const createEraseController = (env: ToolEnv): ToolController => {
    const preview = new ErasePreview(env.scene);
    let stroke: TileStroke | null = null;
    let start: Cell | null = null;
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
        start = null;
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
            start = cell;
            preview.begin(cell);
        },
        onPointerMove: ({ cell, shift }) => {
            if (!stroke || !start) return;

            preview.update({
                shift,
                start,
                cell,
                added: stroke.extend(cell),
                covered: stroke.getCells(),
            });
        },
        onPointerUp: (context) => {
            if (target === ERASE_TARGETS.OBJECTS) {
                eraseObject(context);
                return;
            }
            if (!stroke || !start) return;

            stroke.extend(context.cell);
            const gesture = buildEraseOps(
                context.model,
                layers,
                getEraseCells({
                    shift: context.shift,
                    start,
                    end: context.cell,
                    stroke: stroke.getCells(),
                })
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
