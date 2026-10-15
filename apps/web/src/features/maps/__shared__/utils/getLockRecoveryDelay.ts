import { LOCK_RECOVERY_DELAYS_MS } from "@/features/maps/__shared__/consts/lock-recovery";

// `attempt` is 1 for the first try to get the lock back.
export const getLockRecoveryDelay = (attempt: number): number =>
    LOCK_RECOVERY_DELAYS_MS[
        Math.min(attempt, LOCK_RECOVERY_DELAYS_MS.length) - 1
    ];
