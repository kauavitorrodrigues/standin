import type { EditorAcquireAck } from "@standin/contracts";

// What the editor can ask of the lock it holds. `reacquire` only asks: the
// caller decides, with the answer, whether to `restore` or to `release`.
export type EditorLockControl = {
    reacquire: () => Promise<EditorAcquireAck | null>;
    // Back to held, after a lost lock was got again.
    restore: () => void;
    // The lock was lost (the publish answered 423, for example).
    markLost: () => void;
    // Gives the lock back before leaving and waits for the answer. The unmount
    // does not repeat it, and neither does a second call.
    release: () => Promise<void>;
};
