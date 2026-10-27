import type { Socket } from "socket.io";
import { MediaConsumerReadySchema, MediaEvents } from "@standin/contracts";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

export function registerMediaConsumerReady(socket: Socket) {
    socket.on(MediaEvents.CONSUMER_READY, (payload, ack) =>
        answerMediaRequest(MediaEvents.CONSUMER_READY, ack, async () => {
            const input = parseOrThrow(MediaConsumerReadySchema, payload);
            const { room } = requireExistingMediaContext(socket);

            await room.consumerReady(socket.id, input.consumerId);
            return { ok: true as const };
        })
    );
}
