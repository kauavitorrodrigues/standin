import type { EditScopeKind } from "@standin/contracts";
import type { MapLock } from "./MapLock";
import type { LockUser } from "./lock-user";

export type AcquireGranted = {
    ok: true;
    lock: MapLock;
    // The same person held the lock in another session, in the same mode.
    replacedSessionId?: string;
    // The Studio took the lock from a decorator. The handler tells that
    // session it lost the lock because the map is being edited.
    preemptedSessionId?: string;
};

export type AcquireDenied = {
    ok: false;
    code: "MAP_LOCKED";
    by: LockUser;
    since: string;
    // The mode of the lock that refused the request.
    mode: EditScopeKind;
};

export type AcquireResult = AcquireGranted | AcquireDenied;
