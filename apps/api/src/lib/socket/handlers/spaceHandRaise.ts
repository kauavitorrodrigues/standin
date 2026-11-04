import type { Server, Socket } from "socket.io";
import {
    BaseError,
    HandRaiseInvalidError,
    HandRaiseNotAllowedError,
    SpaceEvents,
    SpaceSetHandRaisedSchema,
} from "@standin/contracts";
import type { SpaceSetHandRaisedAck } from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { RaisedHandSync } from "../realtime/RaisedHandSync";
import { replyAck } from "../utils/replyAck";
import { buildRaisedHandsSender } from "../utils/buildRaisedHandsSender";

const failureOf = (error: unknown): SpaceSetHandRaisedAck => {
    if (error instanceof BaseError) return { ok: false, code: error.code };

    console.error(error);
    return { ok: false, code: new HandRaiseInvalidError().code };
};

/**
 * Raises or lowers a hand. The state is the server's: the client asks and the
 * answer says when the hand went up. Only the people within earshot, and in
 * the same private rooms, are told. Any member may raise a hand, and there is
 * no cap or timeout. Guests are not members, so they cannot.
 */
export function registerSpaceHandRaise(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_SET_HAND_RAISED, (payload, ack) => {
        try {
            const { spaceId, isGuest } = socket.data;
            if (!spaceId || isGuest) throw new HandRaiseNotAllowedError();

            const parsed = SpaceSetHandRaisedSchema.safeParse(payload);
            if (!parsed.success) throw new HandRaiseInvalidError();

            const current = PresenceStore.get(spaceId, socket.id);
            if (!current) throw new HandRaiseNotAllowedError();

            const wanted = parsed.data.raised
                ? (current.handRaisedSince ?? Date.now())
                : null;
            const changed = PresenceStore.setHandRaised(
                spaceId,
                socket.id,
                wanted
            );
            if (changed) {
                RaisedHandSync.refreshAround(
                    spaceId,
                    socket.id,
                    buildRaisedHandsSender(io)
                );
            }
            replyAck<SpaceSetHandRaisedAck>(ack, {
                ok: true,
                raisedSince: wanted,
            });
        } catch (error) {
            replyAck<SpaceSetHandRaisedAck>(ack, failureOf(error));
        }
    });
}
