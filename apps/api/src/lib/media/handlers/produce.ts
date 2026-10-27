import type { Socket } from "socket.io";
import { MediaEvents, MediaProduceSchema } from "@standin/contracts";
import type {
    MediaRtpCapabilities,
    MediaRtpParameters,
    MediaDtlsParameters,
} from "@standin/media";
import { mediaDirty } from "../MediaRuntime";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";
import { toPlain } from "./toPlain";

export function registerMediaProduce(socket: Socket) {
    socket.on(MediaEvents.PRODUCE, (payload, ack) =>
        answerMediaRequest(MediaEvents.PRODUCE, ack, async () => {
            const input = parseOrThrow(MediaProduceSchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            // The transport must be the send transport of this socket, which
            // the room checks, so a producer always belongs to who asked.
            const producerId = await room.produce(
                socket.id,
                input.transportId,
                input.source,
                toPlain<MediaRtpParameters>(input.rtpParameters)
            );

            // The people around may now receive this stream.
            mediaDirty.markMoved(spaceId, socket.id);
            return { ok: true as const, producerId };
        })
    );
}
