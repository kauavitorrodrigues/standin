import type { Socket } from "socket.io";
import { MediaEvents, MediaNotJoinedError } from "@standin/contracts";
import { MediaRuntime } from "../MediaRuntime";
import { answerMediaRequest } from "./mediaRequest";

export function registerMediaRestart(socket: Socket) {
    socket.on(MediaEvents.RESTART, (ack) =>
        answerMediaRequest(MediaEvents.RESTART, ack, async () => {
            const spaceId = socket.data.spaceId as string | null;
            if (!spaceId) throw new MediaNotJoinedError();

            MediaRuntime.leave(spaceId, socket.id);
            return { ok: true as const };
        })
    );
}
