import type { Socket } from "socket.io";
import { EditorEvents, MapEvents } from "@standin/contracts";
import { MapLockService, MapService, UserService } from "@standin/core";
import { EditorLockSchema } from "../schemas/editorLock.schema";
import { EditorSessions } from "../utils/editorSessions";
import { emitMapEvent } from "../utils/emitMapEvent";
import { replyAck } from "../utils/replyAck";

export function registerEditorRelease(socket: Socket) {
    socket.on(EditorEvents.EDITOR_RELEASE, async (payload, ack) => {
        try {
            const parsed = EditorLockSchema.safeParse(payload);
            if (!parsed.success) return replyAck(ack, { ok: false });
            const { mapId, sessionId } = parsed.data;

            const mode = MapLockService.get(mapId)?.mode;
            const released = MapLockService.release(mapId, sessionId);
            if (!released) return replyAck(ack, { ok: false });

            EditorSessions.delete(sessionId);

            // The role is read from the database, never from the socket.
            const user = await UserService.findById(socket.data.userId);
            if (user) {
                const access = await MapService.getAccess(user, mapId);
                emitMapEvent(access, MapEvents.MAP_UNLOCKED, {
                    mapId,
                    mode,
                });
            }

            replyAck(ack, { ok: true });
        } catch (error) {
            console.error(error);
            replyAck(ack, { ok: false });
        }
    });
}
