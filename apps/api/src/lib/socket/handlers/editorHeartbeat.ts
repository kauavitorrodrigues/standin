import type { Socket } from "socket.io";
import { EditorEvents } from "@standin/contracts";
import { MapLockService } from "@standin/core";
import { EditorLockSchema } from "../schemas/editorLock.schema";
import { replyAck } from "../utils/replyAck";

export function registerEditorHeartbeat(socket: Socket) {
    socket.on(EditorEvents.EDITOR_HEARTBEAT, (payload, ack) => {
        try {
            const parsed = EditorLockSchema.safeParse(payload);
            if (!parsed.success) return replyAck(ack, { ok: false });

            const { mapId, sessionId } = parsed.data;
            replyAck(ack, MapLockService.heartbeat(mapId, sessionId));
        } catch (error) {
            console.error(error);
            replyAck(ack, { ok: false });
        }
    });
}
