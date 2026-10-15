import type { EditScopeKind } from "./edit-scope";
import type { EditorLockErrorCode } from "./editor-lock-error-code";
import type { EditorLockHolder } from "./editor-lock-holder";

export type EditorAcquireGranted = {
    ok: true;
    heartbeatMs: number;
    ttlMs: number;
};

export type EditorAcquireDenied = {
    ok: false;
    code: EditorLockErrorCode;
    by?: EditorLockHolder;
    since?: string;
    // The mode of the lock that refused the request.
    mode?: EditScopeKind;
};

export type EditorAcquireAck = EditorAcquireGranted | EditorAcquireDenied;
