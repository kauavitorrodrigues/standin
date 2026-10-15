import {
    EditorEvents,
    LOCK_SWEEP_INTERVAL_MS,
    MapEvents,
} from "@standin/contracts";
import { MapLockService, MapService } from "@standin/core";
import { SocketManager } from "./socketManager";
import { EditorSessions } from "./utils/editorSessions";
import { emitMapEvent } from "./utils/emitMapEvent";

type ExpiredLock = ReturnType<typeof MapLockService.sweepExpired>[number];

async function handleExpiredLock(lock: ExpiredLock): Promise<void> {
    const { mapId, sessionId } = lock;

    const socketId = EditorSessions.get(sessionId);
    EditorSessions.delete(sessionId);
    if (socketId) {
        SocketManager.emitToSocket(socketId, EditorEvents.EDITOR_LOCK_LOST, {
            mapId,
        });
    }

    const owner = await MapService.findOwner(mapId);
    emitMapEvent({ owner, mapId }, MapEvents.MAP_UNLOCKED, { mapId });
}

/**
 * Removes expired editor locks on an interval and tells the room and the old
 * session. A failure on one map is logged and never stops the others.
 * Returns stop(), used by tests and by the graceful shutdown.
 */
export function startLockSweeper(
    intervalMs: number = LOCK_SWEEP_INTERVAL_MS
): () => void {
    const sweep = async () => {
        let expired: ExpiredLock[];
        try {
            expired = MapLockService.sweepExpired();
        } catch (error) {
            console.error(error);
            return;
        }

        for (const lock of expired) {
            try {
                await handleExpiredLock(lock);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const timer = setInterval(() => void sweep(), intervalMs);
    timer.unref();

    return () => clearInterval(timer);
}
