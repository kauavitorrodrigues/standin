import type { MapLock } from "../types/MapLock";
import { isLockExpired } from "./isExpired";

// The lock when it exists and has not expired.
export function findLiveLock(
    lock: MapLock | undefined,
    nowMs: number
): MapLock | null {
    if (!lock) return null;
    if (isLockExpired(lock, nowMs)) return null;
    return lock;
}
