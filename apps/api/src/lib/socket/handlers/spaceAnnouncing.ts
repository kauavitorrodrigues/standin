import type { Server, Socket } from "socket.io";
import {
    AnnouncingInvalidError,
    AnnouncingNotAllowedError,
    BaseError,
    SpaceEvents,
    SpaceSetAnnouncingSchema,
} from "@standin/contracts";
import type { SpaceSetAnnouncingAck } from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { AnnouncerSync } from "../realtime/AnnouncerSync";
import { replyAck } from "../utils/replyAck";
import { buildAnnouncersSender } from "../utils/buildAnnouncersSender";

const failureOf = (error: unknown): SpaceSetAnnouncingAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new AnnouncingInvalidError().code };
};

/**
 * Starts or stops announcing. The state is the server's: the client asks and
 * the answer says when it started. Only the people within earshot, and in the
 * same private rooms, are told. Any member may announce for now, and there is
 * no cap on how many announce at once or for how long. Guests are not members,
 * so they cannot.
 */
export function registerSpaceAnnouncing(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_SET_ANNOUNCING, (payload, ack) => {
        try {
            const { spaceId, isGuest } = socket.data;
            if (!spaceId || isGuest) throw new AnnouncingNotAllowedError();

            const parsed = SpaceSetAnnouncingSchema.safeParse(payload);
            if (!parsed.success) throw new AnnouncingInvalidError();

            const current = PresenceStore.get(spaceId, socket.id);
            if (!current) throw new AnnouncingNotAllowedError();

            const wanted = parsed.data.announcing
                ? (current.announcingSince ?? Date.now())
                : null;
            const changed = PresenceStore.setAnnouncing(
                spaceId,
                socket.id,
                wanted
            );
            if (changed) {
                AnnouncerSync.refreshAround(
                    spaceId,
                    socket.id,
                    buildAnnouncersSender(io)
                );
            }
            replyAck<SpaceSetAnnouncingAck>(ack, {
                ok: true,
                announcingSince: wanted,
            });
        } catch (error) {
            replyAck<SpaceSetAnnouncingAck>(ack, failureOf(error));
        }
    });
}
