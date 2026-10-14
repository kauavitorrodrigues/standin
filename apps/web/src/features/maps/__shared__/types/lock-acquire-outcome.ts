import type { LOCK_ACQUIRE_OUTCOME } from "@/features/maps/__shared__/consts/lock-recovery";

export type LockAcquireOutcome =
    (typeof LOCK_ACQUIRE_OUTCOME)[keyof typeof LOCK_ACQUIRE_OUTCOME];
