import { EDIT_SCOPES } from "@standin/contracts";
import type { EditScopeKind } from "@standin/contracts";
import type { AcquireResult } from "./types/acquire-result";
import type { LockStore } from "./types/lock-store";
import type { MapLock } from "./types/MapLock";
import type { LockUser } from "./types/lock-user";
import { getAcquireVerdict } from "./utils/getAcquireVerdict";
import { findLiveLock } from "./utils/findLiveLock";

export function createAcquireLock(store: LockStore, now: () => number) {
    return function acquireLock(
        mapId: string,
        user: LockUser,
        sessionId: string,
        mode: EditScopeKind = EDIT_SCOPES.MAP
    ): AcquireResult {
        const current = store.get(mapId);
        const nowMs = now();
        const live = findLiveLock(current, nowMs);
        const verdict = getAcquireVerdict({ live, user, sessionId, mode });

        if (live && verdict === "DENY") {
            return {
                ok: false,
                code: "MAP_LOCKED",
                by: { id: live.userId, name: live.userName },
                since: new Date(live.acquiredAt).toISOString(),
                mode: live.mode,
            };
        }

        const lock: MapLock = {
            mapId,
            userId: user.id,
            userName: user.name,
            sessionId,
            mode,
            acquiredAt: nowMs,
            lastHeartbeatAt: nowMs,
        };
        store.set(mapId, lock);

        if (live && verdict === "PREEMPT") {
            return { ok: true, lock, preemptedSessionId: live.sessionId };
        }
        
        if (live && verdict === "TAKE_OVER") {
            return { ok: true, lock, replacedSessionId: live.sessionId };
        }
        
        return { ok: true, lock };
    };
}
