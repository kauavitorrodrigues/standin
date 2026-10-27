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

type RuleParams = Parameters<typeof shouldShowNameTag>[0];

// Reused by every call, so asking the rule for each remote avatar every frame
// builds no object. Safe because the rule reads it synchronously and keeps
// nothing.
const ruleParams: RuleParams = {
    isLocal: false,
    isDecorating: false,
    hasName: false,
    hasPosition: false,
    roomKey: null,
    roomState: ROOM_DOOR_STATES.OPEN,
    localRoomKey: null,
    entitlements: { all: false, roomKeys: new Set<string>() },
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

    ruleParams.isDecorating = isDecorating;
    ruleParams.hasName = hasName;
    ruleParams.hasPosition = hasPosition;
    ruleParams.roomKey = roomKey;
    ruleParams.roomState =
        roomKey === null ? ROOM_DOOR_STATES.OPEN : getRoomState(roomKey);
    ruleParams.localRoomKey = localRoomKey;
    ruleParams.entitlements = entitlements;
    return shouldShowNameTag(ruleParams);
};
