import type { Server, Socket } from "socket.io";
import { SpaceEvents, SpaceJoinSchema } from "@standin/contracts";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { canJoinSpace } from "../services/canJoinSpace";

// No avatar customization feature exists yet, so every peer resolves to a
// null avatarConfig until one does. See AvatarConfig in @standin/contracts.
const resolvePeersInRoom = (io: Server, room: string) => {
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) return [];

    return [...roomSockets]
        .map((socketId) => io.sockets.sockets.get(socketId))
        .filter((peerSocket): peerSocket is Socket => Boolean(peerSocket))
        .map((peerSocket) => ({
            socketId: peerSocket.id,
            userId: peerSocket.data.userId,
            avatarConfig: null,
        }));
};

export function registerJoinSpace(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_JOIN, async (payload) => {
        try {
            const parsed = SpaceJoinSchema.safeParse(payload);
            if (!parsed.success) return;

            const { organizationId, spaceId, userId } = parsed.data;
            // The authenticated identity always wins over whatever userId the
            // client claims in the payload.
            if (userId !== socket.data.userId) return;

            // Already in that space: nothing to do, and re-broadcasting would
            // duplicate peers/renegotiate connections on the client.
            if (socket.data.spaceId === spaceId) return;

            const allowed = await canJoinSpace(userId, organizationId, spaceId);
            if (!allowed) return;

            const previousSpaceId = socket.data.spaceId;
            if (previousSpaceId) {
                const previousRoom = buildSpaceRoom(previousSpaceId);
                socket.to(previousRoom).emit(SpaceEvents.SPACE_PEER_LEFT, {
                    socketId: socket.id,
                    userId,
                });
                await socket.leave(previousRoom);
            }

            const room = buildSpaceRoom(spaceId);
            // Snapshotting before join() avoids a race where two sockets
            // joining in the same tick could both see (and be seen by) each
            // other, which would make both sides think they're the WebRTC
            // initiator in Fase 4.
            const peers = resolvePeersInRoom(io, room);

            socket.data.spaceId = spaceId;
            await socket.join(room);

            socket.emit(SpaceEvents.SPACE_JOINED, { peers });
            socket.to(room).emit(SpaceEvents.SPACE_PEER_JOINED, {
                socketId: socket.id,
                userId,
                avatarConfig: null,
            });
        } catch (error) {
            console.error(error);
        }
    });
}
