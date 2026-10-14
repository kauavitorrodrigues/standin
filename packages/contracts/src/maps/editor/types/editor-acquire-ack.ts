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
};

export type EditorAcquireAck = EditorAcquireGranted | EditorAcquireDenied;
