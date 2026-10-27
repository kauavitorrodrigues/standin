import type { Socket } from "socket.io";
import { RoomEvents, SpaceEvents } from "@standin/contracts";
import { EditorSessions } from "../utils/editorSessions";
import { RoomStates } from "../utils/roomStates";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { applyJoinEffects } from "../utils/applyJoinEffects";
import { PresenceStore } from "../presence/PresenceStore";
import { SpaceInterests } from "../realtime/SpaceInterests";

export function registerDisconnect(socket: Socket) {
    // "disconnect" (not "disconnecting") works here because the room is
    // rebuilt from socket.data.spaceId, not read off socket.rooms (which is
    // already empty by the time "disconnect" fires).
    socket.on("disconnect", () => {
        // The lock itself is not released here, its expiry covers short
        // reconnects. Only the session to socket mapping is dropped.
        EditorSessions.deleteBySocket(socket.id);

        const { spaceId, userId } = socket.data;
        if (!spaceId) {
            // A join still in flight may have added the socket already.
            PresenceStore.removeSocketEverywhere(socket.id);
            return;
        }

        PresenceStore.remove(spaceId, socket.id);
        SpaceInterests.remove(spaceId, socket.id);

        const room = buildSpaceRoom(spaceId);
        socket.to(room).emit(SpaceEvents.SPACE_PEER_LEFT, {
            socketId: socket.id,
            userId,
        });

        // A locked room left empty opens, so it is never locked forever.
        const { changes, effects } = RoomStates.removeSocket(spaceId, socket.id);
        changes.forEach((change) => {
            socket.to(room).emit(RoomEvents.ROOM_STATE, change);
        });
        // The meeting may have ended and requests of this socket are gone.
        applyJoinEffects(() => socket.nsp.sockets, spaceId, effects);
    });
}
