import type {
    LOCK_GIVE_UP_REASON,
    LOCK_RECOVERY,
} from "@/features/maps/__shared__/consts/lock-recovery";

export type LockGiveUpReason =
    (typeof LOCK_GIVE_UP_REASON)[keyof typeof LOCK_GIVE_UP_REASON];

export type LockRecovery =
    | { kind: typeof LOCK_RECOVERY.RESUME }
    | { kind: typeof LOCK_RECOVERY.RETRY }
    | { kind: typeof LOCK_RECOVERY.GIVE_UP; reason: LockGiveUpReason };
