import type { Server, Socket } from "socket.io";
import { RoomEvents, SpaceEvents, SpaceJoinSchema } from "@standin/contracts";
import { SpaceGuestService } from "@standin/core";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { RoomStates } from "../utils/roomStates";
import {
    resolveJoinAccess,
    type JoinAccess,
} from "../services/resolveJoinAccess";
import { buildHostRoom } from "../utils/buildHostRoom";
import { resolveAvatarSheetFileId } from "../services/resolveAvatarSheetFileId";
import {
    resolveUserProfiles,
    type UserProfile,
} from "../services/resolveUserProfiles";
import { applyJoinEffects, sendEntitlements } from "../utils/applyJoinEffects";

// The snapshot stays synchronous on purpose, see the comment where it is taken.
const resolvePeersInRoom = (io: Server, room: string) => {
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) return [];

    return [...roomSockets]
        .map((socketId) => io.sockets.sockets.get(socketId))
        .filter((peerSocket): peerSocket is Socket => Boolean(peerSocket))
        .map((peerSocket) => ({
            socketId: peerSocket.id,
            userId: peerSocket.data.userId as string,
        }));
};

// What the tag shows when a profile could not be read: no name, so the client
// keeps the tag hidden.
const NO_PROFILE: UserProfile = { name: "", profilePictureUrl: null };

// The sheet and the profile are read after the join, so the database never sits
// between the snapshot and the join. The sheets are read one by one and the
// profiles in a single query, all at once.
const attachPresenceData = async (
    peers: { socketId: string; userId: string }[],
    userId: string
) => {
    const [profiles, peerSheets, avatarSheetFileId] = await Promise.all([
        resolveUserProfiles([userId, ...peers.map((peer) => peer.userId)]),
        Promise.all(peers.map((peer) => resolveAvatarSheetFileId(peer.userId))),
        resolveAvatarSheetFileId(userId),
    ]);

    return {
        peers: peers.map((peer, index) => ({
            ...peer,
            avatarSheetFileId: peerSheets[index],
            ...(profiles.get(peer.userId) ?? NO_PROFILE),
        })),
        self: {
            avatarSheetFileId,
            ...(profiles.get(userId) ?? NO_PROFILE),
        },
    };
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

// A host hears the requests of guests from now on, and learns right away the
// ones that came in while no host was around.
const joinAsHost = async (socket: Socket, spaceId: string) => {
    await socket.join(buildHostRoom(spaceId));
    const pending = await SpaceGuestService.listPending(spaceId);
    pending.forEach((guest) => {
        socket.emit(SpaceEvents.SPACE_GUEST_REQUESTED, { guest });
    });
};

// Hosts are members of the organization, which does not end by itself in a
// join. A guest pass can, so a guest is checked again.
const stillHasAccess = async (
    userId: string,
    spaceId: string,
    access: JoinAccess
): Promise<boolean> => {
    if (access.isHost) return true;
    return (await resolveJoinAccess(userId, spaceId)) !== null;
};

export function registerJoinSpace(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_JOIN, async (payload) => {
        try {
            const parsed = SpaceJoinSchema.safeParse(payload);
            if (!parsed.success) return;

            // Only the space comes from the client. The person is the one the
            // token authenticated, and the organization comes from the space.
            const { spaceId } = parsed.data;
            const userId = socket.data.userId as string;

            // Already in that space: nothing to do, and re-broadcasting would
            // duplicate peers/renegotiate connections on the client.
            if (socket.data.spaceId === spaceId) return;

            const access = await resolveJoinAccess(userId, spaceId);
            if (!access) return;

            const previousSpaceId = socket.data.spaceId;
            if (previousSpaceId) {
                const previousRoom = buildSpaceRoom(previousSpaceId);
                socket.to(previousRoom).emit(SpaceEvents.SPACE_PEER_LEFT, {
                    socketId: socket.id,
                    userId,
                });
                await socket.leave(previousRoom);
                await socket.leave(buildHostRoom(previousSpaceId));
                const { changes, effects } = RoomStates.removeSocket(
                    previousSpaceId,
                    socket.id
                );
                changes.forEach((change) => {
                    socket.to(previousRoom).emit(RoomEvents.ROOM_STATE, change);
                });
                applyJoinEffects(
                    () => io.sockets.sockets,
                    previousSpaceId,
                    effects
                );
            }

            const room = buildSpaceRoom(spaceId);
            // Snapshotting before join() avoids a race where two sockets
            // joining in the same tick could both see (and be seen by) each
            // other, which would make both sides think they're the WebRTC
            // initiator.
            const peers = resolvePeersInRoom(io, room);

            disconnectDuplicateSessions(io, peers, userId);
            const remainingPeers = peers.filter(
                (peer) => peer.userId !== userId
            );

            socket.data.spaceId = spaceId;
            socket.data.isGuest = !access.isHost;
            await socket.join(room);

            // The access can end while the join is in flight: a kick that landed
            // before the socket was in the room had nobody to cut. Looking again
            // once inside closes that gap.
            if (!(await stillHasAccess(userId, spaceId, access))) {
                await socket.leave(room);
                socket.data.spaceId = null;
                return;
            }

            const { peers: peersWithAvatar, self } = await attachPresenceData(
                remainingPeers,
                userId
            );

            socket.emit(SpaceEvents.SPACE_JOINED, { peers: peersWithAvatar });
            socket.to(room).emit(SpaceEvents.SPACE_PEER_JOINED, {
                socketId: socket.id,
                userId,
                ...self,
            });
            socket.emit(RoomEvents.ROOM_STATES, {
                rooms: RoomStates.listNotOpen(spaceId),
            });
            if (access.isOwner) RoomStates.setOwner(spaceId, socket.id);
            if (access.isHost) await joinAsHost(socket, spaceId);
            sendEntitlements(new Map([[socket.id, socket]]), spaceId, userId);
        } catch (error) {
            console.error(error);
        }
    });
}
