import type { Socket } from "socket.io";
import { RoomEvents } from "@standin/contracts";
import { RoomStates } from "./roomStates";
import type { JoinEffects } from "./roomStates";

export type SocketsById = Map<string, Socket>;

// Sends the entitlements of a user to each of their sockets in the space.
export const sendEntitlements = (
    sockets: SocketsById,
    spaceId: string,
    userId: string
) => {
    for (const target of sockets.values()) {
        if (target.data.userId !== userId) continue;
        if (target.data.spaceId !== spaceId) continue;
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
