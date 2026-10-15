import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";
import type {
    RoomDoorStates,
    RoomEntitlements,
} from "@/features/game/types/room";
import { isRoomEntitled } from "@/features/game/utils/isRoomEntitled";

const NO_ENTITLEMENTS: RoomEntitlements = { all: false, roomKeys: new Set() };

// The states the door bodies follow for the local avatar. Inside a locked room
// the avatar may still walk out (leaving unlocks it), and an entitled avatar
// may walk into a locked room. Those rooms count as closed for the bodies
// while the door keeps looking locked.
export const getColliderStates = (
    states: RoomDoorStates,
    insideRoomKey: string | null,
    entitlements: RoomEntitlements = NO_ENTITLEMENTS
): RoomDoorStates => {
    let result: Map<string, RoomDoorState> | null = null;

    states.forEach((state, roomKey) => {
        if (state !== ROOM_DOOR_STATES.LOCKED) return;
        const passes =
            roomKey === insideRoomKey || isRoomEntitled(entitlements, roomKey);
        if (!passes) return;

        result ??= new Map(states);
        result.set(roomKey, ROOM_DOOR_STATES.CLOSED);
    });

    return result ?? states;
};
