import type { EditorAcquireAck } from "@standin/contracts";

export type LockStatusInput = {
    // Answer of the last `editor:acquire`, or null while it is pending.
    acquireAck: EditorAcquireAck | null;
    // True after a failed heartbeat or an `editor:lock_lost` event.
    lost: boolean;
};
