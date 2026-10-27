import type { Socket } from "socket.io";
import { MediaEvents, MediaSetLowQualitySchema } from "@standin/contracts";
import { mediaDirty } from "../MediaRuntime";
import { handleMediaMessage, parseOrThrow } from "./mediaRequest";
import { requireExistingMediaContext } from "./mediaContext";

// A weak machine asks for the low layer and fewer streams.
export function registerMediaSetLowQuality(socket: Socket) {
    socket.on(MediaEvents.SET_LOW_QUALITY, (payload) =>
        handleMediaMessage(() => {
            const input = parseOrThrow(MediaSetLowQualitySchema, payload);
            const { spaceId, room } = requireExistingMediaContext(socket);

            room.setLowQuality(socket.id, input.enabled);
            mediaDirty.markReceivers(spaceId, [socket.id]);
        })
    );
}
