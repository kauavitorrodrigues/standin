import type { LockStore } from "./types/lock-store";
import type { MapLockPublish } from "./types/MapLock";
import { isLockExpired } from "./utils/isExpired";

export function createRecordPublish(store: LockStore, now: () => number) {
    // Keeps the last publish on the lock, so a repeated request gets the same
    // answer. The lock stays with whoever published. Answers false when the
    // session no longer holds a live lock, and then nothing is kept.
    return function recordPublish(
        mapId: string,
        sessionId: string,
        publish: MapLockPublish
    ): boolean {
        const lock = store.get(mapId);
        if (!lock) return false;
        if (lock.sessionId !== sessionId) return false;
        if (isLockExpired(lock, now())) return false;
        lock.lastPublish = publish;
        return true;
    };
}
