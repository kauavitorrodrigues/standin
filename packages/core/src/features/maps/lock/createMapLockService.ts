import { createAcquireLock } from "./acquire";
import { createGetLock } from "./get";
import { createHeartbeatLock } from "./heartbeat";
import { createRecordPublish } from "./recordPublish";
import { createReleaseLock } from "./release";
import { createSweepExpiredLocks } from "./sweepExpired";
import type { LockStore } from "./types/lock-store";

export function createMapLockService(now: () => number = Date.now) {
    const store: LockStore = new Map();

    return {
        acquire: createAcquireLock(store, now),
        heartbeat: createHeartbeatLock(store, now),
        release: createReleaseLock(store),
        recordPublish: createRecordPublish(store, now),
        get: createGetLock(store, now),
        sweepExpired: createSweepExpiredLocks(store, now),
    };
}
