import { DOOR_SLOT_STATES } from "@/features/editor/consts/door-hints";
import type { RoomSlotPlan } from "@/features/editor/hooks/room/pickRoomSlotPlan";

type Params = {
    doorAssetId: string | null;
    picked: RoomSlotPlan | null;
};

// Whether the room can take a door now, and how well it fits.
export const getSlotState = ({ doorAssetId, picked }: Params) => {
    if (doorAssetId === null) return DOOR_SLOT_STATES.NO_ASSET;
    if (picked === null) return DOOR_SLOT_STATES.NO_SLOT;
    if (!picked.plan.exact) return DOOR_SLOT_STATES.INEXACT;
    return DOOR_SLOT_STATES.EXACT;
};
