import type { LockStore } from "./types/lock-store";
import type { MapLock } from "./types/MapLock";
import { isLockExpired } from "./utils/isExpired";

export function createGetLock(store: LockStore, now: () => number) {
    return function getLock(mapId: string): MapLock | undefined {
        const lock = store.get(mapId);
        if (!lock) return undefined;
        if (isLockExpired(lock, now())) return undefined;
        return lock;
    };
}
