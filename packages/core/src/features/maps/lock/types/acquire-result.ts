import type { MapLock } from "./MapLock";
import type { LockUser } from "./lock-user";

export type AcquireGranted = {
    ok: true;
    lock: MapLock;
    replacedSessionId?: string;
};

export type AcquireDenied = {
    ok: false;
    code: "MAP_LOCKED";
    by: LockUser;
    since: string;
};

export type AcquireResult = AcquireGranted | AcquireDenied;
