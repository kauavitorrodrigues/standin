import type { AcquireResult } from "./types/acquire-result";
import type { LockStore } from "./types/lock-store";
import type { MapLock } from "./types/MapLock";
import type { LockUser } from "./types/lock-user";
import { isLockExpired } from "./utils/isExpired";

export function createAcquireLock(store: LockStore, now: () => number) {
    return function acquireLock(
        mapId: string,
        user: LockUser,
        sessionId: string
    ): AcquireResult {
        const current = store.get(mapId);
        const nowMs = now();
        const live = current && !isLockExpired(current, nowMs);

        if (live && current.userId !== user.id) {
            return {
                ok: false,
                code: "MAP_LOCKED",
                by: { id: current.userId, name: current.userName },
                since: new Date(current.acquiredAt).toISOString(),
            };
        }

        const lock: MapLock = {
            mapId,
            userId: user.id,
            userName: user.name,
            sessionId,
            acquiredAt: nowMs,
            lastHeartbeatAt: nowMs,
        };
        store.set(mapId, lock);

        const replaced = live && current.sessionId !== sessionId;
        if (replaced) {
            return { ok: true, lock, replacedSessionId: current.sessionId };
        }
        return { ok: true, lock };
    };
}
