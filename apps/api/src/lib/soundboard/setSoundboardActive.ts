import { MediaRuntime, mediaDirty } from "@/lib/media/MediaRuntime";

/**
 * Tells the media server that a clip started or stopped on the microphone of
 * the socket, so a muted person is still heard while it plays. Without a media
 * session there is nothing to change.
 */
export const setSoundboardActive = (
    spaceId: string,
    socketId: string,
    active: boolean
): void => {
    const room = MediaRuntime.getRoom(spaceId);
    if (!room?.hasPeer(socketId)) return;

    room.setSoundboardActive(socketId, active);
    mediaDirty.markMoved(spaceId, socketId);
};
