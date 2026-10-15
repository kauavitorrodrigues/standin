import { DOOR_SLOT_STATES } from "@/features/editor/consts/door-hints";
import { ROOM_PANEL_MESSAGES } from "@/features/editor/consts/messages";

type DoorSlotState = (typeof DOOR_SLOT_STATES)[keyof typeof DOOR_SLOT_STATES];

type Params = {
    doorCount: number;
    slotState: DoorSlotState;
};

const getSlotWarning = (slotState: DoorSlotState): string | null => {
    switch (slotState) {
        case DOOR_SLOT_STATES.NO_ASSET:
            return ROOM_PANEL_MESSAGES.NO_DOOR_ASSET;
        case DOOR_SLOT_STATES.NO_SLOT:
            return ROOM_PANEL_MESSAGES.NO_SLOT;
        case DOOR_SLOT_STATES.INEXACT:
            return ROOM_PANEL_MESSAGES.NOT_EXACT;
        case DOOR_SLOT_STATES.EXACT:
            return null;
    }
};

// The warnings of the room panel, most important first: a room with no door,
// then what stops or limits the next one.
export const getRoomWarnings = ({ doorCount, slotState }: Params): string[] => {
    const warnings: string[] = [];
    if (doorCount === 0) warnings.push(ROOM_PANEL_MESSAGES.NO_DOOR);

    const slotWarning = getSlotWarning(slotState);
    if (slotWarning !== null) warnings.push(slotWarning);
    return warnings;
};
