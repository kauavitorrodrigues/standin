import type { Socket } from "socket.io";
import {
    EditorEvents,
    LOCK_HEARTBEAT_MS,
    LOCK_TTL_MS,
    MapEvents,
} from "@standin/contracts";
import type { EditorAcquireAck } from "@standin/contracts";
import { MapLockService, MapService, UserService } from "@standin/core";
import { EditorLockSchema } from "../schemas/editorLock.schema";
import { EditorSessions } from "../utils/editorSessions";
import { emitMapEvent } from "../utils/emitMapEvent";
import { replyAck } from "../utils/replyAck";
import { SocketManager } from "../socketManager";

const FORBIDDEN: EditorAcquireAck = { ok: false, code: "FORBIDDEN" };

export function registerEditorAcquire(socket: Socket) {
    socket.on(EditorEvents.EDITOR_ACQUIRE, async (payload, ack) => {
        try {
            const parsed = EditorLockSchema.safeParse(payload);
            if (!parsed.success) return replyAck(ack, FORBIDDEN);
            const { mapId, sessionId } = parsed.data;

            // The role is read from the database, never from the socket.
            const user = await UserService.findById(socket.data.userId);
            if (!user) return replyAck(ack, FORBIDDEN);

            const access = await MapService.getAccess(user, mapId);
            if (!access.canEdit) return replyAck(ack, FORBIDDEN);

            const result = MapLockService.acquire(
                mapId,
                { id: user.id, name: user.name },
                sessionId
            );

            if (!result.ok) {
                return replyAck(ack, {
                    ok: false,
                    code: result.code,
                    by: result.by,
                    since: result.since,
                });
            }

            if (result.replacedSessionId) {
                const oldSocketId = EditorSessions.get(result.replacedSessionId);
                EditorSessions.delete(result.replacedSessionId);
                if (oldSocketId && oldSocketId !== socket.id) {
                    SocketManager.emitToSocket(
                        oldSocketId,
                        EditorEvents.EDITOR_LOCK_LOST,
                        { mapId }
                    );
                }
            }

            EditorSessions.set(sessionId, socket.id);

            emitMapEvent(access, MapEvents.MAP_LOCKED, {
                mapId,
                by: { id: user.id, name: user.name },
                since: new Date(result.lock.acquiredAt).toISOString(),
            });

            replyAck(ack, {
                ok: true,
                heartbeatMs: LOCK_HEARTBEAT_MS,
                ttlMs: LOCK_TTL_MS,
            });
        } catch (error) {
            console.error(error);
            replyAck(ack, FORBIDDEN);
        }
    });
}
