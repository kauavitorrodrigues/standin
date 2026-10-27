import type { Socket } from "socket.io";
import { MediaCreateTransportSchema, MediaEvents } from "@standin/contracts";
import type {
    MediaRtpCapabilities,
    MediaRtpParameters,
    MediaDtlsParameters,
} from "@standin/media";
import { mediaDirty } from "../MediaRuntime";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireMediaContext } from "./mediaContext";
import { toPlain } from "./toPlain";

export function registerMediaCreateTransport(socket: Socket) {
    socket.on(MediaEvents.CREATE_TRANSPORT, (payload, ack) =>
        answerMediaRequest(MediaEvents.CREATE_TRANSPORT, ack, async () => {
            const input = parseOrThrow(MediaCreateTransportSchema, payload);
            const { spaceId, room } = await requireMediaContext(socket);

            const transport = await room.createTransport(
                socket.id,
                input.direction,
                toPlain<MediaRtpCapabilities | undefined>(input.rtpCapabilities)
            );

            // A person that can now receive gets a first plan.
            if (input.direction === "recv") {
                mediaDirty.markReceivers(spaceId, [socket.id]);
            }

            return {
                ok: true as const,
                transportId: transport.transportId,
                iceParameters: toPlain<Record<string, unknown>>(
                    transport.iceParameters
                ),
                iceCandidates: toPlain<Record<string, unknown>[]>(
                    transport.iceCandidates
                ),
                dtlsParameters: toPlain<Record<string, unknown>>(
                    transport.dtlsParameters
                ),
            };
        })
    );
}
