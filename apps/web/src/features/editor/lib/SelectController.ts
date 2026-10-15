import type { Cell } from "@standin/contracts";
import { SELECTION_MESSAGES } from "@/features/editor/consts/messages";
import type { ZoneDragController } from "@/features/editor/lib/ZoneDragController";
import type { HoverOutlineView } from "@/features/editor/types/HoverOutlineView";
import type { PlacementGhostView } from "@/features/editor/types/PlacementGhostView";
import type { SelectionProvider } from "@/features/editor/types/SelectionProvider";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";
import { getDragTarget } from "@/features/editor/utils/getDragTarget";
import { getGhostLayout } from "@/features/editor/utils/getGhostLayout";
import { pickSelectionTarget } from "@/features/editor/utils/pickSelectionTarget";
import { planMove } from "@/features/editor/utils/planMove";

const PRIMARY_BUTTON = 0;

// `wasSelected` is true when the press landed on an object that was already
// selected, so a click that does not move it takes the selection off.
type Drag = {
    id: string;
    from: Cell;
    // The press in world px, to drag free by the same distance.
    startX: number;
    startY: number;
    wasSelected: boolean;
};

// A free drag that stays within this many px of the press is a click.
const CLICK_RADIUS = 3;

// The select tool without the placing mode. A click asks every selection
// provider for what is under the pointer and selects the winner (nothing
// clears the selection). A zone is also a target: pressing on the body of one
// moves it, and pressing on a handle of the selected area resizes it (the
// zone drag controller does both). Pressing on an object and dragging shows the ghost
// where it would land, red when the model refuses, and releasing sends ONE
// gesture with a move_asset. A release on the same cell is just a click, and a click on an object that
// was already selected clears the selection.
// Without a press, the object under the pointer gets its contour and the
// pointer cursor (the hover view).
export class SelectController implements ToolController {
    private readonly env: ToolEnv;
    private readonly providers: readonly SelectionProvider[];
    private readonly ghost: PlacementGhostView;
    private readonly zoneDrag: ZoneDragController | null;
    private readonly hover: HoverOutlineView | null;
    private drag: Drag | null = null;

    constructor(
        env: ToolEnv,
        providers: readonly SelectionProvider[],
        ghost: PlacementGhostView,
        zoneDrag: ZoneDragController | null = null,
        hover: HoverOutlineView | null = null
    ) {
        this.env = env;
        this.providers = providers;
        this.ghost = ghost;
        this.zoneDrag = zoneDrag;
        this.hover = hover;
    }

    onDeactivate = (): void => {
        this.reset();
        this.ghost.destroy();
        this.zoneDrag?.destroy();
        this.hover?.destroy();
    };

    onPointerDown = (context: ToolContext): void => {
        if (context.button !== PRIMARY_BUTTON) return;
        if (this.zoneDrag?.pressHandle(context)) return;

        const target = this.pick(context);
        if (!target) {
            this.env.store.clearSelection();
            return;
        }

        const { selection } = this.env.store.getState();
        const wasSelected = selection.includes(target.id);
        this.env.store.setSelection([target.id]);
        if (target.kind === "object") {
            this.drag = {
                id: target.id,
                from: context.cell,
                startX: context.worldX,
                startY: context.worldY,
                wasSelected,
            };
        }
        if (target.kind === "zone") {
            this.zoneDrag?.pressBody(context, target.id);
        }
    };

    onPointerMove = (context: ToolContext): void => {
        if (this.zoneDrag?.isDragging()) {
            this.zoneDrag.onPointerMove(context);
            return;
        }
        if (!this.drag) {
            this.updateHover(context);
            return;
        }
        this.hover?.hide();
        this.preview(context, this.drag);
    };

    onPointerUp = (context: ToolContext): void => {
        if (this.zoneDrag?.isDragging()) {
            this.zoneDrag.onPointerUp(context);
            return;
        }
        const drag = this.drag;
        this.reset();
        if (!drag || context.button !== PRIMARY_BUTTON) return;
        if (!this.hasMoved(context, drag)) {
            if (drag.wasSelected) this.env.store.clearSelection();
            return;
        }

        const plan = this.plan(context, drag);
        if (!plan) return;
        if (plan.reason !== null) {
            context.setHint(describePlacementReason(plan.reason));
            return;
        }

        const result = context.dispatch([plan.op]);
        if (!result.ok) context.setHint(SELECTION_MESSAGES.MOVE_FAILED);
    };

    onPointerLeave = (): void => {
        if (this.drag) return;
        this.hover?.hide();
        this.ghost.hide();
    };

    onCancel = (): void => {
        this.reset();
        this.env.setHint(null);
    };

    private reset(): void {
        this.drag = null;
        this.zoneDrag?.cancel();
        this.hover?.hide();
        this.ghost.hide();
        this.env.setHint(null);
    }

    private pick(context: ToolContext) {
        return pickSelectionTarget(
            this.providers.map((provider) =>
                provider.hitTest({
                    model: context.model,
                    worldX: context.worldX,
                    worldY: context.worldY,
                })
            )
        );
    }

    // Only an object is marked: a zone covers too much ground for a pointer.
    // One that is already selected is not, since its box and its bar are
    // already showing and there is nothing left to point at.
    private updateHover(context: ToolContext): void {
        if (!this.hover) return;

        const target = this.pick(context);
        const { selection } = this.env.store.getState();
        if (target?.kind !== "object" || selection.includes(target.id)) {
            this.hover.hide();
            return;
        }
        this.hover.show(context.model, target.id);
    }

    // On the grid the object moves by whole cells, so a press and a release on
    // the same cell is a click. Free, it is a few px of distance.
    private hasMoved(context: ToolContext, drag: Drag): boolean {
        if (context.ctrl) {
            return (
                drag.from[0] !== context.cell[0] ||
                drag.from[1] !== context.cell[1]
            );
        }
        return (
            Math.hypot(
                context.worldX - drag.startX,
                context.worldY - drag.startY
            ) > CLICK_RADIUS
        );
    }

    private plan(context: ToolContext, drag: Drag) {
        const placed = context.model.placed.find(({ id }) => id === drag.id);
        if (!placed) return null;

        const target = getDragTarget({
            model: context.model,
            placed,
            from: drag.from,
            to: context.cell,
            // Free by default, Ctrl (or Cmd) snaps to the grid, as in placing.
            free: context.ctrl
                ? undefined
                : {
                      startX: drag.startX,
                      startY: drag.startY,
                      x: context.worldX,
                      y: context.worldY,
                  },
        });
        return planMove({ model: context.model, id: drag.id, ...target });
    }

    private preview(context: ToolContext, drag: Drag): void {
        if (!this.hasMoved(context, drag)) {
            this.ghost.hide();
            context.setHint(null);
            return;
        }

        const placed = context.model.placed.find(({ id }) => id === drag.id);
        const asset = context.model.library.assets.find(
            ({ id }) => id === placed?.assetId
        );
        const plan = this.plan(context, drag);
        const layout =
            asset && plan ? getGhostLayout(context.model, asset, plan) : null;
        if (!asset || !plan || !layout) {
            this.ghost.hide();
            return;
        }

        this.ghost.show({
            asset,
            x: layout.x,
            bottomY: layout.bottomY,
            valid: plan.reason === null,
        });
        context.setHint(
            plan.reason === null
                ? SELECTION_MESSAGES.DROP_READY
                : describePlacementReason(plan.reason)
        );
    }
}
