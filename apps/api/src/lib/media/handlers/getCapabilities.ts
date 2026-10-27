import type { Socket } from "socket.io";
import { MediaEvents } from "@standin/contracts";
import { answerMediaRequest } from "./mediaRequest";
import { requireMediaContext } from "./mediaContext";
import { toPlain } from "./toPlain";

export function registerMediaGetCapabilities(socket: Socket) {
    socket.on(MediaEvents.GET_CAPABILITIES, (ack) =>
        answerMediaRequest(MediaEvents.GET_CAPABILITIES, ack, async () => {
            const { room } = await requireMediaContext(socket);
            return {
                ok: true as const,
                rtpCapabilities: toPlain<Record<string, unknown>>(
                    room.rtpCapabilities
                ),
            };
        })
    );
}
