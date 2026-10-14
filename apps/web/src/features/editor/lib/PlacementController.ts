import type { EditorOp } from "@standin/contracts";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import type { PlacementGhostView } from "@/features/editor/types/PlacementGhostView";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { createTempId } from "@/features/editor/utils/createTempId";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";
import { getGhostLayout } from "@/features/editor/utils/getGhostLayout";
import { getPlacementHint } from "@/features/editor/utils/getPlacementHint";
import { planPlacement } from "@/features/editor/utils/planPlacement";

const PRIMARY_BUTTON = 0;

// Free by default, with the object stuck to the pointer. Holding Ctrl (or Cmd)
// snaps it to the grid. Shift is free as well, so it changes nothing.
const getFreePointer = ({
    ctrl,
    worldX,
    worldY,
}: ToolContext): { x: number; y: number } | undefined =>
    ctrl ? undefined : { x: worldX, y: worldY };

// Places objects. It does something only while the store has an asset in
// `placing`: the ghost follows the cursor and a click on a valid spot sends ONE
// gesture with a place_asset. The mode stays on for the next one and Esc leaves
// it. A refused spot sends nothing and says why in the hint.
export class PlacementController implements ToolController {
    private readonly env: ToolEnv;
    private readonly ghost: PlacementGhostView;
    private unsubscribe: (() => void) | null = null;
    private placing: string | null = null;

    constructor(env: ToolEnv, ghost: PlacementGhostView) {
        this.env = env;
        this.ghost = ghost;
    }

    onActivate = (): void => {
        this.placing = this.env.store.getState().placing;
        this.unsubscribe = this.env.store.subscribe(this.handleStore);
    };

    onDeactivate = (): void => {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.ghost.destroy();
    };

    onPointerDown = (context: ToolContext): void => {
        this.preview(context);
    };

    onPointerMove = (context: ToolContext): void => {
        this.preview(context);
    };

    onPointerLeave = (): void => {
        this.ghost.hide();
        this.env.setHint(null);
    };

    onCancel = (): void => {
        this.ghost.hide();
        this.env.setHint(null);
        this.env.store.cancelPlacing();
    };

    onPointerUp = (context: ToolContext): void => {
        if (context.button !== PRIMARY_BUTTON) return;

        const assetId = this.env.store.getState().placing;
        if (!assetId) return;

        const plan = planPlacement(
            context.model,
            assetId,
            context.cell,
            getFreePointer(context)
        );
        if (!plan.result.ok) {
            context.setHint(getPlacementHint(plan.result));
            return;
        }
        if (!plan.asset) return;

        const op: EditorOp = {
            type: "place_asset",
            tempId: createTempId(),
            assetId: plan.asset.id,
            tileX: plan.tileX,
            tileY: plan.tileY,
            offsetX: plan.offsetX,
            offsetY: plan.offsetY,
            ...(plan.parentId ? { parentId: plan.parentId } : {}),
        };
        const result = context.dispatch([op]);
        if (!result.ok) {
            const [issue] = result.errors;
            context.setHint(
                issue
                    ? describePlacementReason(issue.code)
                    : PLACEMENT_MESSAGES.GENERIC
            );
            return;
        }

        // The model the context carries is the one before this object. The
        // ghost comes back with the next move, drawn against the new draft.
        this.ghost.hide();
        context.setHint(null);
    };

    // A different asset (or none) invalidates the ghost on screen.
    private handleStore = (): void => {
        const { placing } = this.env.store.getState();
        if (placing === this.placing) return;

        this.placing = placing;
        this.ghost.hide();
        this.env.setHint(null);
    };

    private preview(context: ToolContext): void {
        const assetId = this.env.store.getState().placing;
        if (!assetId) {
            this.ghost.hide();
            return;
        }

        const plan = planPlacement(
            context.model,
            assetId,
            context.cell,
            getFreePointer(context)
        );
        const hint = getPlacementHint(plan.result);
        const layout = plan.asset
            ? getGhostLayout(context.model, plan.asset, plan)
            : null;
        if (!plan.asset || !layout) {
            this.ghost.hide();
            context.setHint(hint);
            return;
        }

        this.ghost.show({
            asset: plan.asset,
            x: layout.x,
            bottomY: layout.bottomY,
            valid: plan.result.ok,
        });
        context.setHint(hint);
    }
}
