import type { MapLockState } from "@standin/contracts";
import type { MapLock } from "../types/MapLock";

/** The public shape of a lock: who holds it and since when, no session. */
export function toLockState(lock: MapLock | undefined): MapLockState {
    if (!lock) return { locked: false };

    return {
        locked: true,
        by: { id: lock.userId, name: lock.userName },
        since: new Date(lock.acquiredAt).toISOString(),
    };
}
