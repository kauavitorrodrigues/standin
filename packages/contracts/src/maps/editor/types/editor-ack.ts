// Ack of `editor:heartbeat` and `editor:release`. For a heartbeat, `ok: false`
// means the lock was lost.
export type EditorAck = {
    ok: boolean;
};
