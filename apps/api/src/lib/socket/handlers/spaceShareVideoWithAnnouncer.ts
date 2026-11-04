import type { Socket } from "socket.io";
import {
    BaseError,
    ShareVideoInvalidError,
    ShareVideoNoAnnouncerError,
    ShareVideoNotAllowedError,
    SpaceEvents,
    SpaceShareVideoWithAnnouncerSchema,
} from "@standin/contracts";
import type { SpaceShareVideoWithAnnouncerAck } from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { AnnouncerSync } from "../realtime/AnnouncerSync";
import { AnnouncerVideo } from "../realtime/AnnouncerVideo";
import { replyAck } from "../utils/replyAck";

const failureOf = (error: unknown): SpaceShareVideoWithAnnouncerAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new ShareVideoInvalidError().code };
};

// Sharing again keeps the first start, so the answer does not move.
const sharingSinceOf = (sharing: boolean, since: number | null) => {
    if (!sharing) return null;
    return since ?? Date.now();
};

/**
 * Starts or stops showing the camera to the people who announce near this
 * person. By default an announcer gets no camera from the people listening.
 * The choice only holds while someone announces within earshot, so it can only
 * start then, and it ends by itself when nobody does. Guests cannot, and
 * stopping is always allowed.
 */
export function registerSpaceShareVideoWithAnnouncer(socket: Socket) {
    socket.on(SpaceEvents.SPACE_SHARE_VIDEO_WITH_ANNOUNCER, (payload, ack) => {
        try {
            const { spaceId, isGuest } = socket.data;
            if (!spaceId || isGuest) throw new ShareVideoNotAllowedError();

            const parsed =
                SpaceShareVideoWithAnnouncerSchema.safeParse(payload);
            if (!parsed.success) throw new ShareVideoInvalidError();

            const current = PresenceStore.get(spaceId, socket.id);
            if (!current) throw new ShareVideoNotAllowedError();

            if (
                parsed.data.sharing &&
                !AnnouncerSync.hasAnnouncers(socket.id)
            ) {
                throw new ShareVideoNoAnnouncerError();
            }

            const wanted = sharingSinceOf(
                parsed.data.sharing,
                current.sharingVideoWithAnnouncerSince
            );
            const changed = PresenceStore.setSharingVideoWithAnnouncer(
                spaceId,
                socket.id,
                wanted
            );
            if (changed) AnnouncerVideo.apply(spaceId, socket.id);
            replyAck<SpaceShareVideoWithAnnouncerAck>(ack, {
                ok: true,
                sharingSince: wanted,
            });
        } catch (error) {
            replyAck<SpaceShareVideoWithAnnouncerAck>(ack, failureOf(error));
        }
    });
}
