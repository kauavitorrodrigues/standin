import { buildStampOps, canPlaceStamp } from "@standin/contracts";
import { AREA_PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import type { AreaGhostView } from "@/features/editor/types/AreaGhostView";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { createRoomKey } from "@/features/editor/utils/createRoomKey";
import { createTempId } from "@/features/editor/utils/createTempId";
import { describeAreaPlacementIssues } from "@/features/editor/utils/describeAreaPlacementIssues";
import { describeAreaPlacementReason } from "@/features/editor/utils/describeAreaPlacementReason";
import { getLayoutZoneKeys } from "@/features/editor/utils/getLayoutZoneKeys";

const PRIMARY_BUTTON = 0;

// Places areas. It does something only while the store has an area in
// `placingArea`: the ghost follows the cursor with the cell under it as the
// top left corner, and a click on a valid spot sends ONE gesture with all the
// operations of the stamp. The mode stays on for the next one and Esc leaves
// it. A refused spot sends nothing and says why in the hint.
export class AreaPlacementController implements ToolController {
    private readonly env: ToolEnv;
    private readonly ghost: AreaGhostView;
    private unsubscribe: (() => void) | null = null;
    private placingId: string | null = null;

    constructor(env: ToolEnv, ghost: AreaGhostView) {
        this.env = env;
        this.ghost = ghost;
    }

    onActivate = (): void => {
        this.placingId = this.getPlacingId();
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
        this.env.store.cancelPlacingArea();
    };

    onPointerUp = (context: ToolContext): void => {
        if (context.button !== PRIMARY_BUTTON) return;

        const placing = this.env.store.getState().placingArea;
        if (!placing) return;

        const [tileX, tileY] = context.cell;
        const check = canPlaceStamp(context.model, placing.stamp, tileX, tileY);
        if (!check.ok) {
            context.setHint(describeAreaPlacementReason(check.reason));
            return;
        }

        // Nothing reaches the draft unless every operation applies.
        const built = buildStampOps(
            context.model,
            placing.stamp,
            tileX,
            tileY,
            createTempId,
            undefined,
            () =>
                createRoomKey({
                    taken: getLayoutZoneKeys(context.model.layout),
                })
        );
        if (!built.ok) {
            context.setHint(describeAreaPlacementIssues(built.errors));
            return;
        }

        const result = context.dispatch(built.ops);
        if (!result.ok) {
            context.setHint(describeAreaPlacementIssues(result.errors));
            return;
        }

        // The model the context carries is the one before this area. The
        // ghost comes back with the next move, drawn against the new draft.
        this.ghost.hide();
        context.setHint(null);
    };

    private getPlacingId(): string | null {
        const placing = this.env.store.getState().placingArea;
        return placing ? `${placing.area.id}:${placing.area.version}` : null;
    }

    // A different area (or none) invalidates the ghost on screen.
    private handleStore = (): void => {
        const placingId = this.getPlacingId();
        if (placingId === this.placingId) return;

        this.placingId = placingId;
        this.ghost.hide();
        this.env.setHint(null);
    };

    private preview(context: ToolContext): void {
        const placing = this.env.store.getState().placingArea;
        if (!placing) {
            this.ghost.hide();
            return;
        }

        const [tileX, tileY] = context.cell;
        const check = canPlaceStamp(context.model, placing.stamp, tileX, tileY);
        this.ghost.show({ area: placing.area, tileX, tileY, valid: check.ok });
        context.setHint(
            check.ok
                ? AREA_PLACEMENT_MESSAGES.READY
                : describeAreaPlacementReason(check.reason)
        );
    }
}
