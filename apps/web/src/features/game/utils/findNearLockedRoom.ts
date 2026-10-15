import { ROOM_DOOR_STATES } from "@standin/contracts";
import type {
    GameRoomDoor,
    RoomDoorStates,
    RoomEntitlements,
} from "@/features/game/types/room";
import { isRoomEntitled } from "@/features/game/utils/isRoomEntitled";
import { isWithinReach } from "@/features/game/utils/isWithinReach";

type Point = { x: number; y: number };

export type NearLockedRoomInput = {
    doors: readonly GameRoomDoor[];
    point: Point;
    states: RoomDoorStates;
    entitlements: RoomEntitlements;
    // The room the avatar is inside, which is never one to ask to join.
    insideRoomKey: string | null;
    // How close to a door cell counts as near, in px.
    reach: number;
};

/**
 * The key of the locked room whose door the avatar is near, when it is not
 * inside that room and may not enter it. Null when there is none.
 */
export const findNearLockedRoom = ({
    doors,
    point,
    states,
    entitlements,
    insideRoomKey,
    reach,
}: NearLockedRoomInput): string | null => {
    for (const door of doors) {
        if (door.roomKey === insideRoomKey) continue;
        if (states.get(door.roomKey) !== ROOM_DOOR_STATES.LOCKED) continue;
        if (isRoomEntitled(entitlements, door.roomKey)) continue;
        if (isWithinReach(door, point, reach)) return door.roomKey;
    }
    return null;
};
