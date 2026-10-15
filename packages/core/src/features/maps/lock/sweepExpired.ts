import type { LockStore } from "./types/lock-store";
import type { MapLock } from "./types/MapLock";
import { isLockExpired } from "./utils/isExpired";

export function createSweepExpiredLocks(store: LockStore, now: () => number) {
    return function sweepExpiredLocks(): MapLock[] {
        const nowMs = now();
        const removed: MapLock[] = [];
        for (const [mapId, lock] of store) {
            if (!isLockExpired(lock, nowMs)) continue;
            store.delete(mapId);
            removed.push(lock);
        }
        return removed;
    };
}
