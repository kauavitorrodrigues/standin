import type { Socket } from "socket.io";
import { SpaceEvents } from "@standin/contracts";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";

export function registerDisconnect(socket: Socket) {
    // "disconnect" (not "disconnecting") works here because the room is
    // rebuilt from socket.data.spaceId, not read off socket.rooms (which is
    // already empty by the time "disconnect" fires).
    socket.on("disconnect", () => {
        const { spaceId, userId } = socket.data;
        if (!spaceId) return;

        socket.to(buildSpaceRoom(spaceId)).emit(SpaceEvents.SPACE_PEER_LEFT, {
            socketId: socket.id,
            userId,
        });
    });
}
