import type { DoorSlot, EditorModel } from "@standin/contracts";
import type { DoorSlotPlan } from "@/features/editor/utils/doorSlots";

type Params = {
    model: EditorModel;
    slots: readonly DoorSlot[];
    roomKey: string;
    doorAssetId: string;
    planAt: (
        model: EditorModel,
        slot: DoorSlot,
        doorAssetId: string
    ) => DoorSlotPlan | null;
};

export type RoomSlotPlan = { slot: DoorSlot; plan: DoorSlotPlan };

// The first slot of THIS room where the door can be placed, with its plan.
// A slot with no plan, or whose plan the model refuses, is skipped.
export const pickRoomSlotPlan = ({
    model,
    slots,
    roomKey,
    doorAssetId,
    planAt,
}: Params): RoomSlotPlan | null => {
    for (const slot of slots) {
        if (slot.roomKey !== roomKey) continue;

        const plan = planAt(model, slot, doorAssetId);
        if (plan?.plan.result.ok) return { slot, plan };
    }
    return null;
};
