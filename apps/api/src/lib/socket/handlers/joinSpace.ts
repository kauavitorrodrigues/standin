import type { Server, Socket } from "socket.io";
import { RoomEvents, SpaceEvents, SpaceJoinSchema } from "@standin/contracts";
import { SpaceGuestService } from "@standin/core";
import { countQueries } from "@standin/database";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { RoomStates } from "../utils/roomStates";
import {
    resolveJoinAccess,
    type JoinAccess,
} from "../services/resolveJoinAccess";
import { resolveCachedJoinAccess } from "../services/resolveCachedJoinAccess";
import { buildHostRoom } from "../utils/buildHostRoom";
import { resolveAvatarSheetFileId } from "../services/resolveAvatarSheetFileId";
import { resolveSpaceSettings } from "../services/resolveSpaceSettings";
import { resolveUserProfile } from "../services/resolveUserProfile";
import { applyJoinEffects, sendEntitlements } from "../utils/applyJoinEffects";
import { PresenceStore } from "../presence/PresenceStore";
import { SpaceInterests } from "../realtime/SpaceInterests";
import { MediaRuntime } from "@/lib/media/MediaRuntime";
import type { PresenceEntry } from "../presence/PresenceStore";

// What the person who joins needs to be drawn: the only thing read from the
// database in a join, and the only thing read once per person. The ones already
// inside come from the presence of the space.
const resolveSelfEntry = async (
    socketId: string,
    userId: string
): Promise<PresenceEntry> => {
    const [profile, avatarSheetFileId] = await Promise.all([
        resolveUserProfile(userId),
        resolveAvatarSheetFileId(userId),
    ]);
    return {
        socketId,
        userId,
        avatarSheetFileId,
        muted: true,
        headphones: false,
        focus: false,
        ...profile,
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
    spaceId: string,
    userId: string
) => {
    PresenceStore.findSocketIdsOfUser(spaceId, userId).forEach((socketId) => {
        const duplicateSocket = io.sockets.sockets.get(socketId);
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
// join. A guest pass can, so a guest is checked again. It reads the database
// on purpose: the cache may hold an answer read before the pass ended.
const stillHasAccess = async (
    userId: string,
    spaceId: string,
    access: JoinAccess
): Promise<boolean> => {
    if (access.isHost) return true;
    return (await resolveJoinAccess(userId, spaceId)) !== null;
};

// What the others need to draw a person, with no field of the presence that
// is only for the server.
const toPeerPayload = ({
    socketId,
    userId,
    avatarSheetFileId,
    name,
    profilePictureUrl,
    muted,
    headphones,
    focus,
}: PresenceEntry) => ({
    socketId,
    userId,
    avatarSheetFileId,
    name,
    profilePictureUrl,
    muted,
    headphones,
    focus,
});

const leavePreviousSpace = async (
    io: Server,
    socket: Socket,
    previousSpaceId: string,
    userId: string
) => {
    const previousRoom = buildSpaceRoom(previousSpaceId);
    PresenceStore.remove(previousSpaceId, socket.id);
    SpaceInterests.remove(previousSpaceId, socket.id);
    MediaRuntime.leave(previousSpaceId, socket.id);
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
    applyJoinEffects(() => io.sockets.sockets, previousSpaceId, effects);
};

export function registerJoinSpace(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_JOIN, (payload) =>
        countQueries("space:join", async () => {
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

                const access = await resolveCachedJoinAccess(userId, spaceId);
                if (!access) return;

                const previousSpaceId = socket.data.spaceId;
                if (previousSpaceId) {
                    await leavePreviousSpace(
                        io,
                        socket,
                        previousSpaceId,
                        userId
                    );
                }

                const [self, settings] = await Promise.all([
                    resolveSelfEntry(socket.id, userId),
                    resolveSpaceSettings(spaceId),
                ]);

                // The socket may have dropped while the reads were in flight. The
                // disconnect handler found no space to clean, so adding the person
                // now would leave a presence nobody removes.
                if (!socket.connected) return;

                // Everything between reading the presence and adding the person is
                // synchronous on purpose: two sockets joining in the same tick
                // cannot both see (and be seen by) each other, which would make
                // both sides think they are the one that starts the connection.
                disconnectDuplicateSessions(io, spaceId, userId);
                const peers = PresenceStore.list(spaceId).filter(
                    (peer) => peer.userId !== userId
                );
                PresenceStore.add(spaceId, self);

                const room = buildSpaceRoom(spaceId);
                socket.data.spaceId = spaceId;
                socket.data.isGuest = !access.isHost;
                await socket.join(room);

                // The disconnect handler already cleaned the space and told the room
                // the person left, so announcing them now would bring a ghost back.
                if (!socket.connected) return;

                // The access can end while the join is in flight: a kick that landed
                // before the socket was in the room had nobody to cut. Looking again
                // once inside closes that gap.
                if (!(await stillHasAccess(userId, spaceId, access))) {
                    PresenceStore.remove(spaceId, socket.id);
                    SpaceInterests.remove(spaceId, socket.id);
                    MediaRuntime.leave(spaceId, socket.id);
                    await socket.leave(room);
                    socket.data.spaceId = null;
                    return;
                }
                if (!socket.connected) return;

                socket.emit(SpaceEvents.SPACE_JOINED, {
                    settings,
                    peers: peers.map(toPeerPayload),
                });
                socket.to(room).emit(SpaceEvents.SPACE_PEER_JOINED, {
                    socketId: socket.id,
                    userId,
                    avatarSheetFileId: self.avatarSheetFileId,
                    name: self.name,
                    profilePictureUrl: self.profilePictureUrl,
                    muted: self.muted,
                    headphones: self.headphones,
                    focus: self.focus,
                });
                socket.emit(RoomEvents.ROOM_STATES, {
                    rooms: RoomStates.listNotOpen(spaceId),
                });
                if (access.isOwner) RoomStates.setOwner(spaceId, socket.id);
                if (access.isHost) await joinAsHost(socket, spaceId);
                sendEntitlements(
                    new Map([[socket.id, socket]]),
                    spaceId,
                    userId
                );
            } catch (error) {
                console.error(error);
            }
        })
    );
}
