import type { MapLockState } from "@standin/contracts";
import type { MapLock } from "../types/MapLock";

/** The public shape of a lock: who holds it, since when and in which mode, no session. */
export function toLockState(lock: MapLock | undefined): MapLockState {
    if (!lock) return { locked: false };

    return {
        locked: true,
        by: { id: lock.userId, name: lock.userName },
        since: new Date(lock.acquiredAt).toISOString(),
        mode: lock.mode,
    };
}
