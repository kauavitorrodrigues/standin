import { useMemo, useState } from "react";
import {
    PLACEMENT_MESSAGES,
    ROOM_PANEL_MESSAGES,
} from "@/features/editor/consts/messages";
import { DOOR_SLOT_STATES } from "@/features/editor/consts/door-hints";
import { useDraftSelector } from "@/features/editor/hooks/useDraftSelector";
import { useDraftStore } from "@/features/editor/hooks/useDraftStore";
import { buildDoorPlaceOp } from "@/features/editor/hooks/room/buildDoorPlaceOp";
import { getDoorAssets } from "@/features/editor/hooks/room/getDoorAssets";
import { getRoomDoorLabels } from "@/features/editor/hooks/room/getRoomDoorLabels";
import { getRoomWarnings } from "@/features/editor/hooks/room/getRoomWarnings";
import { getSlotState } from "@/features/editor/hooks/room/getSlotState";
import { pickRoomSlotPlan } from "@/features/editor/hooks/room/pickRoomSlotPlan";
import { buildRemoveOps } from "@/features/editor/utils/buildRemoveOps";
import { describePlacementReason } from "@/features/editor/utils/describePlacementReason";
import {
    getDoorSlots,
    planDoorAtSlot,
} from "@/features/editor/utils/doorSlots";
import { getRoomDoorIds } from "@/features/editor/utils/getRoomDoorIds";
import { resolveDoorAssetId } from "@/features/editor/hooks/room/getDoorAssets";

// What the room panel shows and does for one room: its doors, the door
// assets, the next free slot and the warnings. Adding and removing go through
// the draft as one gesture each, the same ops as placing and deleting.
export const useRoomDoors = (
    roomKey: string,
    chosenAssetId: string | undefined
) => {
    const draftStore = useDraftStore();
    const model = useDraftSelector((state) => state.draft);
    const [notice, setNotice] = useState<string | null>(null);

    const doorAssets = useMemo(() => getDoorAssets(model), [model]);
    const doorAssetId = resolveDoorAssetId(doorAssets, chosenAssetId);
    const doors = useMemo(
        () => getRoomDoorLabels(model, getRoomDoorIds(model, roomKey)),
        [model, roomKey]
    );
    const picked = useMemo(() => {
        if (doorAssetId === null) return null;
        return pickRoomSlotPlan({
            model,
            slots: getDoorSlots(model, doorAssetId),
            roomKey,
            doorAssetId,
            planAt: planDoorAtSlot,
        });
    }, [model, roomKey, doorAssetId]);

    const slotState = getSlotState({ doorAssetId, picked });
    const warnings = getRoomWarnings({ doorCount: doors.length, slotState });
    const canAdd =
        slotState === DOOR_SLOT_STATES.EXACT ||
        slotState === DOOR_SLOT_STATES.INEXACT;

    const addDoor = () => {
        if (picked === null || doorAssetId === null) return;

        const result = draftStore.dispatchGesture([
            buildDoorPlaceOp(picked.plan, doorAssetId),
        ]);
        if (result.ok) {
            setNotice(null);
            return;
        }
        const [issue] = result.errors;
        setNotice(
            issue
                ? describePlacementReason(issue.code)
                : PLACEMENT_MESSAGES.GENERIC
        );
    };

    const removeDoor = (id: string) => {
        const plan = buildRemoveOps({ model, ids: [id] });
        const result = draftStore.dispatchGesture(plan.ops);
        setNotice(result.ok ? null : ROOM_PANEL_MESSAGES.REMOVE_FAILED);
    };

    return {
        doors,
        doorAssets,
        warnings,
        notice,
        canAdd,
        addDoor,
        removeDoor,
    };
};
