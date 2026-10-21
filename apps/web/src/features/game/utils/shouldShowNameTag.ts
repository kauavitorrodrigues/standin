import { ROOM_DOOR_STATES, type RoomDoorState } from "@standin/contracts";
import type { RoomEntitlements } from "@/features/game/types/room";
import { isRoomEntitled } from "@/features/game/utils/isRoomEntitled";

type Params = {
    isLocal: boolean;
    // The decorator is open, where the avatars are not targets.
    isDecorating: boolean;
    // The tag has a name to show.
    hasName: boolean;
    // The position of the peer reached us. Until then its avatar stands at the
    // spawn point, which is outside every room, so its tag would be somewhere
    // it is not.
    hasPosition: boolean;
    // The room the avatar stands in, null outside every room.
    roomKey: string | null;
    roomState: RoomDoorState;
    // The room the local avatar stands in.
    localRoomKey: string | null;
    entitlements: RoomEntitlements;
};

// The tag is a DOM element over the whole canvas, so it also draws over the
// dark layer of a room. The name of someone inside a locked room must not be
// readable from outside, so that tag hides unless the local avatar is in the
// same room or may walk into it.
export const shouldShowNameTag = ({
    isLocal,
    isDecorating,
    hasName,
    hasPosition,
    roomKey,
    roomState,
    localRoomKey,
    entitlements,
}: Params): boolean => {
    if (!hasName) return false;
    if (isLocal) return true;
    if (!hasPosition) return false;
    if (isDecorating) return false;
    if (roomKey === null || roomKey === localRoomKey) return true;
    if (roomState !== ROOM_DOOR_STATES.LOCKED) return true;

    return isRoomEntitled(entitlements, roomKey);
};
