import type { Socket } from "socket.io";
import { RoomEvents } from "@standin/contracts";
import { RoomStates } from "./roomStates";
import type { JoinEffects } from "./roomStates";
import { PresenceStore } from "../presence/PresenceStore";

export type SocketsById = Map<string, Socket>;

// Sends the entitlements of a user to each of their sockets in the space. The
// sockets come from the presence of the space, so nobody else is visited.
export const sendEntitlements = (
    sockets: SocketsById,
    spaceId: string,
    userId: string
) => {
    for (const socketId of PresenceStore.findSocketIdsOfUser(spaceId, userId)) {
        const target = sockets.get(socketId);
        if (!target) continue;
        target.emit(
            RoomEvents.ROOM_ENTITLEMENTS,
            RoomStates.entitlements(spaceId, target.id, userId)
        );
    }
};

// Tells the sockets inside that a request is over, and the users who lost the
// rooms they were let into that the meeting ended. `getSockets` is read only
// when there is something to send.
export const applyJoinEffects = (
    getSockets: () => SocketsById,
    spaceId: string,
    effects: JoinEffects
) => {
    const { cancelled, lostUsers } = effects;
    if (cancelled.length === 0 && lostUsers.length === 0) return;

    const sockets = getSockets();
    for (const { roomKey, userId, notify } of cancelled) {
        for (const socketId of notify) {
            sockets
                .get(socketId)
                ?.emit(RoomEvents.ROOM_JOIN_CANCELLED, { roomKey, userId });
        }
    }
    for (const userId of new Set(lostUsers)) {
        sendEntitlements(sockets, spaceId, userId);
    }
};
