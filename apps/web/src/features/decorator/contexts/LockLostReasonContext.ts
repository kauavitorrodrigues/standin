import { createContext } from "react";
import type { EditorLockLostReason } from "@standin/contracts";

// Why the lock was lost, when the server said so. The gate that holds the lock
// provides it, and the notice over the panel reads it.
export const LockLostReasonContext = createContext<EditorLockLostReason | null>(
    null
);
