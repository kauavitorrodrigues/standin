import type { Socket } from "socket.io";
import { EditorEvents } from "@standin/contracts";
import { MapLockService, MapService, UserService } from "@standin/core";
import { EditorLockSchema } from "../schemas/editorLock.schema";
import { canLockInMode } from "../utils/canLockInMode";
import { replyAck } from "../utils/replyAck";

export function registerEditorHeartbeat(socket: Socket) {
    socket.on(EditorEvents.EDITOR_HEARTBEAT, async (payload, ack) => {
        try {
            const parsed = EditorLockSchema.safeParse(payload);
            if (!parsed.success) return replyAck(ack, { ok: false });
            const { mapId, sessionId } = parsed.data;

            const lock = MapLockService.get(mapId);
            if (!lock || lock.sessionId !== sessionId) {
                return replyAck(ack, { ok: false });
            }

            // The permission is read again, so a person who left the
            // organization loses the lock on the next heartbeat.
            const user = await UserService.findById(socket.data.userId);
            if (!user) return replyAck(ack, { ok: false });
            const access = await MapService.getAccess(user, mapId);
            if (!canLockInMode(access, lock.mode)) {
                return replyAck(ack, { ok: false });
            }

            replyAck(ack, MapLockService.heartbeat(mapId, sessionId));
        } catch (error) {
            console.error(error);
            replyAck(ack, { ok: false });
        }
    });
}
