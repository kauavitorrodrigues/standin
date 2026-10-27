import type { Socket } from "socket.io";
import { MediaCloseProducerSchema, MediaEvents } from "@standin/contracts";
import { mediaDirty } from "../MediaRuntime";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

export function registerMediaCloseProducer(socket: Socket) {
    socket.on(MediaEvents.CLOSE_PRODUCER, (payload, ack) =>
        answerMediaRequest(MediaEvents.CLOSE_PRODUCER, ack, async () => {
            const input = parseOrThrow(MediaCloseProducerSchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            // Only a producer of this socket can be closed by it.
            room.closeProducer(socket.id, input.producerId);
            mediaDirty.markMoved(spaceId, socket.id);
            return { ok: true as const };
        })
    );
}
