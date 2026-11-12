import type { Server, Socket } from "socket.io";
import {
    AVAILABILITIES,
    BaseError,
    SpaceEvents,
    SpaceSetStatusSchema,
    StatusInvalidError,
    StatusNotAllowedError,
} from "@standin/contracts";
import type { SpaceSetStatusAck, SpaceStatusPayload } from "@standin/contracts";
import { mediaDirty, MediaRuntime } from "@/lib/media/MediaRuntime";
import { PresenceStore } from "../presence/PresenceStore";
import { StatusExpiry } from "../realtime/StatusExpiry";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { replyAck } from "../utils/replyAck";

const failureOf = (error: unknown): SpaceSetStatusAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new StatusInvalidError().code };
};

// The custom status ran out. The person is told as well, so every screen they
// have open clears it.
const expire = (
    io: Server,
    spaceId: string,
    socketId: string,
    expiresAt: number
) => {
    const entry = PresenceStore.expireCustomStatus(
        spaceId,
        socketId,
        expiresAt
    );
    if (!entry) return;

    io.to(buildSpaceRoom(spaceId)).emit(SpaceEvents.SPACE_STATUS, {
        socketId,
        userId: entry.userId,
        availability: entry.availability,
        customStatus: null,
    } satisfies SpaceStatusPayload);
};

// Away leaves the avatar standing where it is, and the media rules cut every
// connection with the person, like headphones do. The neighbours are marked so
// the planner runs.
const applyAway = (spaceId: string, socketId: string, away: boolean) => {
    const room = MediaRuntime.getRoom(spaceId);
    if (room?.hasPeer(socketId)) room.setAway(socketId, away);
    mediaDirty.markMoved(spaceId, socketId);
};

/**
 * Sets the status of a person: away or active, and what they are up to. The
 * whole space is told, since a status is for anyone who looks at the person.
 * Each request replaces the previous status. A custom status with an end is
 * cleared by the server when the time is up, and the space is told then too.
 * Away also cuts the person from the media. Guests may have a status as well.
 */
export function registerSpaceStatus(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_SET_STATUS, (payload, ack) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) throw new StatusNotAllowedError();

            const parsed = SpaceSetStatusSchema.safeParse(payload);
            if (!parsed.success) throw new StatusInvalidError();

            const current = PresenceStore.get(spaceId, socket.id);
            if (!current) throw new StatusNotAllowedError();

            const status = parsed.data;
            const changed = PresenceStore.setStatus(spaceId, socket.id, status);
            if (changed) {
                if (status.availability !== current.availability) {
                    applyAway(
                        spaceId,
                        socket.id,
                        status.availability === AVAILABILITIES.AWAY
                    );
                }
                const expiresAt = status.customStatus?.expiresAt ?? null;
                if (expiresAt === null) StatusExpiry.cancel(socket.id);
                if (expiresAt !== null) {
                    StatusExpiry.schedule(socket.id, expiresAt, () =>
                        expire(io, spaceId, socket.id, expiresAt)
                    );
                }
                socket
                    .to(buildSpaceRoom(spaceId))
                    .emit(SpaceEvents.SPACE_STATUS, {
                        socketId: socket.id,
                        userId: current.userId,
                        ...status,
                    } satisfies SpaceStatusPayload);
            }
            replyAck<SpaceSetStatusAck>(ack, { ok: true, status });
        } catch (error) {
            replyAck<SpaceSetStatusAck>(ack, failureOf(error));
        }
    });
}
