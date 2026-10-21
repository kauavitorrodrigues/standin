import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";
import type { GameRoom, RoomEntitlements } from "@/features/game/types/room";
import { getRoomAt } from "@/features/game/utils/getRoomAt";
import { shouldShowNameTag } from "@/features/game/utils/shouldShowNameTag";

type Params = {
    // The feet of the remote avatar.
    feet: { x: number; y: number };
    rooms: readonly GameRoom[];
    getRoomState: (roomKey: string) => RoomDoorState;
    // The room the local avatar stands in.
    localRoomKey: string | null;
    entitlements: RoomEntitlements;
    isDecorating: boolean;
    hasName: boolean;
    hasPosition: boolean;
};

// Whether the tag over a remote avatar may show: finds the room the avatar
// stands in and the state the server gave that room, and asks the rule.
export const isRemoteNameTagAllowed = ({
    feet,
    rooms,
    getRoomState,
    localRoomKey,
    entitlements,
    isDecorating,
    hasName,
    hasPosition,
}: Params): boolean => {
    const roomKey = getRoomAt(rooms, feet)?.key ?? null;

    return shouldShowNameTag({
        isLocal: false,
        isDecorating,
        hasName,
        hasPosition,
        roomKey,
        roomState:
            roomKey === null ? ROOM_DOOR_STATES.OPEN : getRoomState(roomKey),
        localRoomKey,
        entitlements,
    });
};
