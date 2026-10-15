import type { EditorModel } from "@standin/contracts";
import { createUnlockedObjectProvider } from "@/features/game/lib/createUnlockedObjectProvider";
import { HoverOutline } from "@/features/editor/lib/HoverOutline";
import { PlacementController } from "@/features/editor/lib/PlacementController";
import { PlacementGhost } from "@/features/editor/lib/PlacementGhost";
import { SelectController } from "@/features/editor/lib/SelectController";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";

// The controller of the decorator, on the select tool. It is the one of the
// map editor without zones and areas: while the store has an asset in
// `placing` the pointer goes to the placement, otherwise it selects and moves
// objects. A press stays with the controller it started on until the button
// goes up.
export const createDecoratorController = (
    env: ToolEnv,
    // Objects the person cannot touch (the desks of other people and what is
    // on them): they answer no click and never get selected.
    isLocked: (model: Readonly<EditorModel>, id: string) => boolean
): ToolController => {
    const placement = new PlacementController(
        env,
        new PlacementGhost(env.scene)
    );
    const select = new SelectController(
        env,
        [createUnlockedObjectProvider(env, isLocked)],
        new PlacementGhost(env.scene),
        null,
        new HoverOutline(env.scene)
    );
    let pressed: ToolController | null = null;
    let unsubscribe: (() => void) | null = null;

    const current = (): ToolController =>
        env.store.getState().placing !== null ? placement : select;

    const handleStore = () => {
        if (current() === select) return;
        select.onCancel();
    };

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
