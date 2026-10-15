import { LOCK_TTL_MS } from "@standin/contracts";
import type { MapLock } from "../types/MapLock";

export function isLockExpired(lock: MapLock, nowMs: number): boolean {
    return nowMs - lock.lastHeartbeatAt > LOCK_TTL_MS;
}
