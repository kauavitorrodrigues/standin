import { MediaEvents } from "@standin/contracts";
import type { SpaceMedia } from "@standin/media";
import { PresenceStore } from "@/lib/socket/presence/PresenceStore";
import { SocketManager } from "@/lib/socket/socketManager";

// What each person was last told, so a message goes out only when it changes.
const lastSent = new Map<string, string>();

/**
 * Tells each person who is speaking among the people they can hear, as user
 * ids, and only when that list changed. Volatile, so a lost message is
 * replaced by the next one.
 */
export const emitSpeakers = (spaceId: string, room: SpaceMedia): void => {
    room.peerIds().forEach((peerId) => {
        const userIds = room
            .speakersFor(peerId)
            .map((speakerId) => PresenceStore.get(spaceId, speakerId)?.userId)
            .filter((id): id is string => id !== undefined);
        const key = userIds.join(",");
        if ((lastSent.get(peerId) ?? "") === key) return;

        if (key === "") lastSent.delete(peerId);
        else lastSent.set(peerId, key);
        SocketManager.emitVolatileToSocket(peerId, MediaEvents.SPEAKERS, {
            userIds,
        });
    });
};

export const forgetSpeakers = (peerId: string): void => {
    lastSent.delete(peerId);
};
