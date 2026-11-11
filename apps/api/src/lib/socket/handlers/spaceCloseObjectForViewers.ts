import type { Server, Socket } from "socket.io";
import {
    ActiveObjectNotAllowedError,
    BaseError,
    CloseObjectForViewersInvalidError,
    CloseObjectForViewersNotAllowedError,
    SpaceCloseObjectForViewersSchema,
    SpaceEvents,
} from "@standin/contracts";
import type {
    SpaceCloseObjectForViewersAck,
    SpaceObjectClosedPayload,
} from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { replyAck } from "../utils/replyAck";

const failureOf = (error: unknown): SpaceCloseObjectForViewersAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new CloseObjectForViewersInvalidError().code };
};

/**
 * Closes an object for everyone looking at it. Only the view is closed:
 * nothing is deleted and anyone can open the object again. Whoever asks has to
 * be looking at it, and guests do not decide for the others.
 */
export function registerSpaceCloseObjectForViewers(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_CLOSE_OBJECT_FOR_VIEWERS, (payload, ack) => {
        try {
            const { spaceId, isGuest } = socket.data;
            if (!spaceId) throw new ActiveObjectNotAllowedError();
            if (isGuest) throw new CloseObjectForViewersNotAllowedError();

            const parsed = SpaceCloseObjectForViewersSchema.safeParse(payload);
            if (!parsed.success) throw new CloseObjectForViewersInvalidError();

            const { objectId } = parsed.data;
            const current = PresenceStore.get(spaceId, socket.id);
            if (current?.activeInteractionObjectId !== objectId) {
                throw new CloseObjectForViewersNotAllowedError();
            }

            PresenceStore.clearActiveObject(spaceId, objectId);
            io.to(buildSpaceRoom(spaceId)).emit(
                SpaceEvents.SPACE_OBJECT_CLOSED,
                {
                    objectId,
                    closedByUserId: current.userId,
                } satisfies SpaceObjectClosedPayload
            );
            replyAck<SpaceCloseObjectForViewersAck>(ack, { ok: true });
        } catch (error) {
            replyAck<SpaceCloseObjectForViewersAck>(ack, failureOf(error));
        }
    });
}
