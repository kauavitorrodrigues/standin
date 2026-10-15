import type { LockStore } from "./types/lock-store";
import { isLockExpired } from "./utils/isExpired";

export function createHeartbeatLock(store: LockStore, now: () => number) {
    return function heartbeatLock(
        mapId: string,
        sessionId: string
    ): { ok: boolean } {
        const lock = store.get(mapId);
        if (!lock) return { ok: false };
        if (lock.sessionId !== sessionId) return { ok: false };
        if (isLockExpired(lock, now())) return { ok: false };
        lock.lastHeartbeatAt = now();
        return { ok: true };
    };
}
