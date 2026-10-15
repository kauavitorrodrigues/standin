import { EditorEvents } from "@standin/contracts";
import type { EditorLockLostReason } from "@standin/contracts";
import { EditorSessions } from "./editorSessions";
import { SocketManager } from "../socketManager";

/**
 * Tells the editor session that lost the lock, unless it is the socket that
 * just took it. `MAP_EDITING` is a decorator that the Studio pushed out.
 */
export const notifyLostSession = (
    takerSocketId: string,
    mapId: string,
    lostSessionId: string | undefined,
    reason: EditorLockLostReason
): void => {
    if (!lostSessionId) return;

    const oldSocketId = EditorSessions.get(lostSessionId);
    EditorSessions.delete(lostSessionId);
    if (!oldSocketId || oldSocketId === takerSocketId) return;

    SocketManager.emitToSocket(oldSocketId, EditorEvents.EDITOR_LOCK_LOST, {
        mapId,
        reason,
    });
};
