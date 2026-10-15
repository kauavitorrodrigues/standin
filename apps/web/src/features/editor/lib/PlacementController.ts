import {
    ASSET_TYPES,
    TILE_SIZE,
    type DoorSlot,
    type EditorModel,
    type EditorOp,
    type Zone,
} from "@standin/contracts";
import { DOOR_SLOT_SNAP } from "@/features/editor/consts/door-slots";
import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";
import type { DoorSlotOverlayView } from "@/features/editor/types/DoorSlotOverlayView";
import type { PlacementGhostView } from "@/features/editor/types/PlacementGhostView";
import type {
    ToolContext,
    ToolController,
} from "@/features/editor/types/ToolController";
import type { ToolEnv } from "@/features/editor/types/ToolEnv";
import { createTempId } from "@/features/editor/utils/createTempId";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";
import {
    getDoorSlots,
    planDoorAtSlot,
} from "@/features/editor/utils/doorSlots";
import { findNearestDoorSlot } from "@/features/editor/utils/findNearestDoorSlot";
import { getGhostLayout } from "@/features/editor/utils/getGhostLayout";
import { getDoorHint } from "@/features/editor/utils/getDoorHint";
import { getPlacementHint } from "@/features/editor/utils/getPlacementHint";
import { hasPrivateZone } from "@/features/editor/utils/hasPrivateZone";
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

type PlaceOpPlan = {
    tileX: number;
    tileY: number;
    offsetX: number;
    offsetY: number;
    parentId?: string | null;
};

const buildPlaceOp = (assetId: string, plan: PlaceOpPlan): EditorOp => ({
    type: "place_asset",
    tempId: createTempId(),
    assetId,
    tileX: plan.tileX,
    tileY: plan.tileY,
    offsetX: plan.offsetX,
    offsetY: plan.offsetY,
    ...(plan.parentId ? { parentId: plan.parentId } : {}),
});

// What the pointer resolved to: the plan and whether it is a door spot that
// works but whose sprite does not match the wall.
type ResolvedPlan = {
    plan: ReturnType<typeof planPlacement>;
    warning: boolean;
    // A door with no gap near the pointer, so the free spot is shown instead.
    noDoorSlot: boolean;
};

type SlotCache = {
    model: Readonly<EditorModel>;
    assetId: string;
    slots: DoorSlot[];
};

// Places objects. It does something only while the store has an asset in
// `placing`: the ghost follows the cursor and a click on a valid spot sends ONE
// gesture with a place_asset. The mode stays on for the next one and Esc leaves
// it. A refused spot sends nothing and says why in the hint.
export class PlacementController implements ToolController {
    private readonly env: ToolEnv;
    private readonly ghost: PlacementGhostView;
    private unsubscribe: (() => void) | null = null;
    private readonly slotOverlay: DoorSlotOverlayView | null;
    private placing: string | null = null;
    private slotCache: SlotCache | null = null;
    private shownSlots: DoorSlot[] | null = null;

    constructor(
        env: ToolEnv,
        ghost: PlacementGhostView,
        slotOverlay?: DoorSlotOverlayView
    ) {
        this.env = env;
        this.ghost = ghost;
        this.slotOverlay = slotOverlay ?? null;
    }

    onActivate = (): void => {
        this.placing = this.env.store.getState().placing;
        this.unsubscribe = this.env.store.subscribe(this.handleStore);
    };

    onDeactivate = (): void => {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.ghost.destroy();
        this.slotOverlay?.destroy();
        this.slotCache = null;
        this.shownSlots = null;
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

        const { plan, noDoorSlot } = this.resolve(context, assetId);
        if (!plan.result.ok) {
            context.setHint(this.getHint(context, plan, noDoorSlot));
            return;
        }
        if (!plan.asset) return;

        const op = buildPlaceOp(plan.asset.id, plan);
        const vetoed = this.env.veto?.([op], context.model) ?? null;
        if (vetoed !== null) {
            context.setHint(vetoed);
            return;
        }
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
        this.hideSlots();
        this.ghost.hide();
        this.env.setHint(null);
    };

    private getDoorRooms(): readonly Zone[] | undefined {
        return this.env.getDoorRooms?.() ?? undefined;
    }

    // Why the host refuses the placement the plan describes, or null.
    private getVeto(
        context: ToolContext,
        plan: ReturnType<typeof planPlacement>
    ): string | null {
        if (!plan.result.ok || !plan.asset) return null;

        const op = buildPlaceOp(plan.asset.id, plan);
        return this.env.veto?.([op], context.model) ?? null;
    }

    private preview(context: ToolContext): void {
        const assetId = this.env.store.getState().placing;
        if (!assetId) {
            this.hideSlots();
            this.ghost.hide();
            return;
        }

        const { plan, warning, noDoorSlot } = this.resolve(context, assetId);
        const vetoed = this.getVeto(context, plan);
        const hint = vetoed ?? this.getHint(context, plan, noDoorSlot);
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
            valid: plan.result.ok && vetoed === null,
            warning,
        });
        context.setHint(hint);
    }

    // In the area composer the frame answers for the rooms, so the lack of a
    // room on the map says nothing there and the old gap hint stays.
    private hasDoorRoom(context: ToolContext): boolean {
        if (this.getDoorRooms() !== undefined) return true;
        return hasPrivateZone(context.model.layout);
    }

    private getHint(
        context: ToolContext,
        plan: ReturnType<typeof planPlacement>,
        noDoorSlot: boolean
    ): string {
        if (noDoorSlot && !plan.result.ok) {
            return (
                getDoorHint(this.hasDoorRoom(context), false) ??
                PLACEMENT_MESSAGES.DOOR_NO_SLOT
            );
        }
        return getPlacementHint(plan.result);
    }

    // The plan for the pointer. A door jumps to the nearest gap in a wall, with
    // the rotation of that side. Anything else, or a door with no gap near,
    // goes where the pointer is.
    private resolve(context: ToolContext, assetId: string): ResolvedPlan {
        const free = (): ReturnType<typeof planPlacement> =>
            planPlacement(
                context.model,
                assetId,
                context.cell,
                getFreePointer(context),
                this.getDoorRooms()
            );

        const asset = context.model.library.assets.find(
            ({ id }) => id === assetId
        );
        if (asset?.type !== ASSET_TYPES.DOOR) {
            this.hideSlots();
            return { plan: free(), warning: false, noDoorSlot: false };
        }

        const slots = this.getSlots(context.model as EditorModel, assetId);
        this.showSlots(slots);
        const slot = findNearestDoorSlot(
            slots,
            {
                x: context.worldX / TILE_SIZE,
                y: context.worldY / TILE_SIZE,
            },
            DOOR_SLOT_SNAP.RADIUS_TILES
        );
        const snapped = slot
            ? planDoorAtSlot(context.model as EditorModel, slot, assetId)
            : null;
        if (!snapped) {
            return { plan: free(), warning: false, noDoorSlot: true };
        }

        return {
            plan: snapped.plan,
            warning: !snapped.exact,
            noDoorSlot: false,
        };
    }

    // The gaps are computed once per model, never per pointer move.
    private getSlots(model: EditorModel, assetId: string): DoorSlot[] {
        const cache = this.slotCache;
        if (cache && cache.model === model && cache.assetId === assetId) {
            return cache.slots;
        }

        const slots = getDoorSlots(model, assetId);
        this.slotCache = { model, assetId, slots };
        return slots;
    }

    private showSlots(slots: DoorSlot[]): void {
        if (this.shownSlots === slots) return;

        this.shownSlots = slots;
        this.slotOverlay?.show(slots);
    }

    private hideSlots(): void {
        if (this.shownSlots === null) return;

        this.shownSlots = null;
        this.slotOverlay?.hide();
    }
}
