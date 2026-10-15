import { SELECTION_PROVIDERS } from "@/features/editor/consts/selectionProviders";
import { HoverOutline } from "@/features/editor/lib/HoverOutline";
import { PlacementController } from "@/features/editor/lib/PlacementController";
import { PlacementGhost } from "@/features/editor/lib/PlacementGhost";
import { ZoneDragController } from "@/features/editor/lib/ZoneDragController";
import { ZonePreview } from "@/features/editor/lib/ZonePreview";
import { SelectController } from "@/features/editor/lib/SelectController";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The controller registered on the SELECT tool. It joins two jobs that share
// the tool: placing the asset the palette picked and selecting what is on the
// map. While the store has an asset in `placing` the pointer goes to the
// placement; otherwise it goes to the selection. A press stays with the
// controller it started on until the button goes up, so a change of `placing`
// in the middle of it cannot split a gesture.
export const createSelectController = (env: ToolEnv): ToolController => {
    const placement = new PlacementController(
        env,
        new PlacementGhost(env.scene)
    );
    const select = new SelectController(
        env,
        SELECTION_PROVIDERS.map((create) => create(env)),
        new PlacementGhost(env.scene),
        new ZoneDragController(env, new ZonePreview(env.scene)),
        new HoverOutline(env.scene)
    );
    let pressed: ToolController | null = null;

    const current = (): ToolController =>
        env.store.getState().placing === null ? select : placement;

    const handleStore = () => {
        if (env.store.getState().placing === null) return;
        select.onCancel();
    };
    let unsubscribe: (() => void) | null = null;

    return {
        onActivate: () => {
            placement.onActivate();
            unsubscribe = env.store.subscribe(handleStore);
        },
        onDeactivate: () => {
            unsubscribe?.();
            unsubscribe = null;
            pressed = null;
            placement.onDeactivate();
            select.onDeactivate();
        },
        onPointerDown: (context: ToolContext) => {
            pressed = current();
            pressed.onPointerDown?.(context);
        },
        onPointerMove: (context: ToolContext) => {
            (pressed ?? current()).onPointerMove?.(context);
        },
        onPointerUp: (context: ToolContext) => {
            const controller = pressed ?? current();
            pressed = null;
            controller.onPointerUp?.(context);
        },
        onPointerLeave: () => {
            placement.onPointerLeave?.();
            select.onPointerLeave?.();
        },
        onCancel: () => {
            pressed = null;
            placement.onCancel?.();
            select.onCancel?.();
        },
    };
};
