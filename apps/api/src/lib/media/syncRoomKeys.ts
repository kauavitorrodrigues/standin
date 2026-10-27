import type { SpaceMedia } from "@standin/media";
import { RoomStates } from "@/lib/socket/utils/roomStates";
import { mediaDirty } from "./MediaRuntime";

/**
 * The private room of each person lives in the door states of the sockets.
 * Copies it to the media room and marks whoever changed room, so people split
 * by a door lose each other on the next tick and the ones who met start
 * hearing each other.
 */
export const syncRoomKeys = (spaceId: string, room: SpaceMedia): void => {
    const keys = RoomStates.roomKeysBySocket(spaceId);
    room.peerIds().forEach((peerId) => {
        const next = keys.get(peerId) ?? null;
        if (room.roomKeyOf(peerId) === next) return;
        room.setRoomKey(peerId, next);
        mediaDirty.markMoved(spaceId, peerId);
    });
};
