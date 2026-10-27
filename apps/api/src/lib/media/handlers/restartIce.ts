import type { Socket } from "socket.io";
import { MediaEvents, MediaRestartIceSchema } from "@standin/contracts";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";
import { toPlain } from "./toPlain";

/**
 * Answers with new ICE parameters for one of the transports of the person, so
 * the browser recovers a dropped connection without building the session again.
 */
export function registerMediaRestartIce(socket: Socket) {
    socket.on(MediaEvents.RESTART_ICE, (payload, ack) =>
        answerMediaRequest(MediaEvents.RESTART_ICE, ack, async () => {
            const input = parseOrThrow(MediaRestartIceSchema, payload);
            const { room } = requireExistingMediaContext(socket);

            const iceParameters = await room.restartIce(
                socket.id,
                input.transportId
            );
            return {
                ok: true as const,
                iceParameters: toPlain<Record<string, unknown>>(iceParameters),
            };
        })
    );
}
