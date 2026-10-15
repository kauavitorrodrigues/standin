import type { EditorAcquireAck } from "@standin/contracts";
import { LOCK_ACQUIRE_OUTCOME } from "@/features/maps/__shared__/consts/lock-recovery";
import type { LockAcquireOutcome } from "@/features/maps/__shared__/types/lock-acquire-outcome";

// A null answer means the server did not answer in time.
export const getLockAcquireOutcome = (
    ack: EditorAcquireAck | null
): LockAcquireOutcome => {
    if (ack === null) return LOCK_ACQUIRE_OUTCOME.NETWORK;
    if (ack.ok) return LOCK_ACQUIRE_OUTCOME.GRANTED;
    return LOCK_ACQUIRE_OUTCOME.DENIED;
};
