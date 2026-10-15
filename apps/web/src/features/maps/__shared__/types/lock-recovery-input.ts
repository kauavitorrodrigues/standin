import type { EditorAcquireAck } from "@standin/contracts";

export type LockRecoveryInput = {
    // Answer of the try to get the lock back, or null when it got no answer
    // (network down, timeout).
    ack: EditorAcquireAck | null;
    // Version published now, or null when it could not be read.
    publishedVersion: number | null;
    // Version the draft started from.
    baseVersion: number;
};
