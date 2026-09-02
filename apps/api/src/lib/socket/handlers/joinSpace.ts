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

// A user is identified per-socket (one browser tab = one connection), not
// per-account, so nothing stops the same account from joining the same
// space twice from two tabs. Each would render as a separate remote
// avatar to everyone else, including the two tabs seeing each other. Force
// out any older connection for this userId already in the room before the
// new one joins: disconnect(true) triggers our own disconnect handler,
// which emits space:peer-left for the old socket to the rest of the room,
// and socket.io-client doesn't auto-reconnect after a server-initiated
// disconnect, so this doesn't create a rejoin/kick loop between the tabs.
const disconnectDuplicateSessions = (
    io: Server,
    peers: ReturnType<typeof resolvePeersInRoom>,
    userId: string
) => {
    peers
        .filter((peer) => peer.userId === userId)
        .forEach((peer) => {
            const duplicateSocket = io.sockets.sockets.get(peer.socketId);
            duplicateSocket?.emit(SpaceEvents.SPACE_DUPLICATE_SESSION);
            duplicateSocket?.disconnect(true);
        });
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
            // initiator.
            const peers = resolvePeersInRoom(io, room);

            disconnectDuplicateSessions(io, peers, userId);
            const remainingPeers = peers.filter((peer) => peer.userId !== userId);

            socket.data.spaceId = spaceId;
            await socket.join(room);

            socket.emit(SpaceEvents.SPACE_JOINED, { peers: remainingPeers });
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
