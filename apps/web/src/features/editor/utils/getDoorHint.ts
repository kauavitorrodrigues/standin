import { PLACEMENT_MESSAGES } from "@/features/editor/consts/messages";

// What the footer says while a door is being placed and the pointer is not on
// a gap, or null when there is nothing to add. Without a room the door has
// nowhere to go, so that comes first. With a room it is only about the gap.
export const getDoorHint = (
    hasRoom: boolean,
    nearSlot: boolean
): string | null => {
    switch (hasRoom) {
        case false:
            return PLACEMENT_MESSAGES.DOOR_NEEDS_ROOM;
        case true:
            if (nearSlot) return null;
            return PLACEMENT_MESSAGES.DOOR_NO_SLOT;
    }
};
