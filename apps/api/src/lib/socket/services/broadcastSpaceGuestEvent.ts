import { SpaceEvents } from "@standin/contracts";
import type { SpaceGuestEvent } from "@standin/core";
import { SocketManager } from "../socketManager";
import { buildHostRoom } from "../utils/buildHostRoom";
import { buildUserRoom } from "../utils/buildUserRoom";
import { JoinAccessCache } from "./joinAccessCache";

/**
 * Carries the steps of the approval to the right sockets: the requests to the
 * hosts, the answer to the guest alone, and the end of the access to the
 * sockets the guest has inside the space.
 */
export const broadcastSpaceGuestEvent = async (
    event: SpaceGuestEvent
): Promise<void> => {
    switch (event.type) {
        case "requested":
            JoinAccessCache.invalidate(event.guest.userId, event.guest.spaceId);
            SocketManager.emitToRoom(
                buildHostRoom(event.guest.spaceId),
                SpaceEvents.SPACE_GUEST_REQUESTED,
                { guest: event.guest }
            );
            return;
        case "updated":
            JoinAccessCache.invalidateSpace(event.spaceId);
            SocketManager.emitToRoom(
                buildHostRoom(event.spaceId),
                SpaceEvents.SPACE_GUEST_UPDATED,
                { spaceId: event.spaceId }
            );
            return;
        case "status":
            JoinAccessCache.invalidateUser(event.userId);
            SocketManager.emitToUser(
                event.userId,
                SpaceEvents.SPACE_GUEST_STATUS,
                event.state
            );
            return;
        case "removed": {
            JoinAccessCache.invalidate(event.userId, event.spaceId);
            const sockets = await SocketManager.get()
                .in(buildUserRoom(event.userId))
                .fetchSockets();
            for (const socket of sockets) {
                if (socket.data.spaceId !== event.spaceId) continue;
                socket.emit(SpaceEvents.SPACE_GUEST_REMOVED, {
                    spaceId: event.spaceId,
                    userId: event.userId,
                });
                // The disconnect handler tells the room the peer left.
                socket.disconnect(true);
            }
            return;
        }
    }
};
