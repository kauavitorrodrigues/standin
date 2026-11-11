import type { Socket } from "socket.io";
import {
    ActiveObjectInvalidError,
    ActiveObjectNotAllowedError,
    BaseError,
    SpaceEvents,
    SpaceSetActiveObjectSchema,
} from "@standin/contracts";
import type {
    SpaceActiveObjectPayload,
    SpaceSetActiveObjectAck,
} from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { isWebsiteObjectOfSpace } from "../services/isWebsiteObjectOfSpace";
import { buildSpaceRoom } from "../utils/buildSpaceRoom";
import { replyAck } from "../utils/replyAck";

const failureOf = (error: unknown): SpaceSetActiveObjectAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new ActiveObjectInvalidError().code };
};

/**
 * Opens or closes the object a person is looking at, such as an embedded
 * website. The whole space is told, since the people looking at an object are
 * not necessarily near it. Guests may look too. Whether the person is within
 * reach of the object is up to the client: the server only checks that the
 * object is a website of the map of the space.
 */
export function registerSpaceActiveObject(socket: Socket) {
    socket.on(SpaceEvents.SPACE_SET_ACTIVE_OBJECT, async (payload, ack) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) throw new ActiveObjectNotAllowedError();

            const parsed = SpaceSetActiveObjectSchema.safeParse(payload);
            if (!parsed.success) throw new ActiveObjectInvalidError();

            const { objectId } = parsed.data;
            if (objectId !== null) {
                const isWebsite = await isWebsiteObjectOfSpace(
                    spaceId,
                    objectId
                );
                if (!isWebsite) throw new ActiveObjectInvalidError();
            }

            // The socket may have left while the object was being checked.
            if (socket.data.spaceId !== spaceId) {
                throw new ActiveObjectNotAllowedError();
            }
            const current = PresenceStore.get(spaceId, socket.id);
            if (!current) throw new ActiveObjectNotAllowedError();

            const changed = PresenceStore.setActiveObject(
                spaceId,
                socket.id,
                objectId
            );
            if (changed) {
                socket
                    .to(buildSpaceRoom(spaceId))
                    .emit(SpaceEvents.SPACE_ACTIVE_OBJECT, {
                        socketId: socket.id,
                        userId: current.userId,
                        objectId,
                    } satisfies SpaceActiveObjectPayload);
            }
            replyAck<SpaceSetActiveObjectAck>(ack, { ok: true, objectId });
        } catch (error) {
            replyAck<SpaceSetActiveObjectAck>(ack, failureOf(error));
        }
    });
}
