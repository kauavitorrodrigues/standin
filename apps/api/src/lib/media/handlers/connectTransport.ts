import type { Socket } from "socket.io";
import { MediaConnectTransportSchema, MediaEvents } from "@standin/contracts";
import type {
    MediaRtpCapabilities,
    MediaRtpParameters,
    MediaDtlsParameters,
} from "@standin/media";
import { answerMediaRequest, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";
import { toPlain } from "./toPlain";

export function registerMediaConnectTransport(socket: Socket) {
    socket.on(MediaEvents.CONNECT_TRANSPORT, (payload, ack) =>
        answerMediaRequest(MediaEvents.CONNECT_TRANSPORT, ack, async () => {
            const input = parseOrThrow(MediaConnectTransportSchema, payload);
            const { room } = requireExistingMediaContext(socket);

            await room.connectTransport(
                socket.id,
                input.transportId,
                toPlain<MediaDtlsParameters>(input.dtlsParameters)
            );
            return { ok: true as const };
        })
    );
}
