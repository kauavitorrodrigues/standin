import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";

export type RoomLockAction = "lock" | "unlock";

export type RoomLockButton = {
    action: RoomLockAction;
    label: string;
};

// What the padlock button offers for the current state of the room.
export const getRoomLockButton = (state: RoomDoorState): RoomLockButton => {
    switch (state) {
        case ROOM_DOOR_STATES.LOCKED:
            return { action: "unlock", label: "Destrancar sala" };
        default:
            return { action: "lock", label: "Trancar sala" };
    }
};
