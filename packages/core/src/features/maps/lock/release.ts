import type { LockStore } from "./types/lock-store";

export function createReleaseLock(store: LockStore) {
    return function releaseLock(mapId: string, sessionId: string): boolean {
        const lock = store.get(mapId);
        if (!lock) return false;
        if (lock.sessionId !== sessionId) return false;
        store.delete(mapId);
        return true;
    };
}
