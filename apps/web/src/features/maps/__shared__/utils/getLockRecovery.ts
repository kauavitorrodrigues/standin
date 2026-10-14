import {
    LOCK_ACQUIRE_OUTCOME,
    LOCK_GIVE_UP_REASON,
    LOCK_RECOVERY,
} from "@/features/maps/__shared__/consts/lock-recovery";
import type { LockRecovery } from "@/features/maps/__shared__/types/lock-recovery";
import type { LockRecoveryInput } from "@/features/maps/__shared__/types/lock-recovery-input";
import { getLockAcquireOutcome } from "@/features/maps/__shared__/utils/getLockAcquireOutcome";

const RESUME: LockRecovery = { kind: LOCK_RECOVERY.RESUME };
const RETRY: LockRecovery = { kind: LOCK_RECOVERY.RETRY };

const getGrantedRecovery = (
    publishedVersion: number | null,
    baseVersion: number
): LockRecovery => {
    if (publishedVersion === null) return RETRY;
    if (publishedVersion === baseVersion) return RESUME;
    return {
        kind: LOCK_RECOVERY.GIVE_UP,
        reason: LOCK_GIVE_UP_REASON.VERSION_CHANGED,
    };
};

// What to do after a try to get the lock back. Resuming needs the lock and
// the same published version as the draft started from. Someone else holding
// the lock is final. A missing answer, or a version that could not be read, is
// a network problem, so the caller tries again.
export const getLockRecovery = ({
    ack,
    publishedVersion,
    baseVersion,
}: LockRecoveryInput): LockRecovery => {
    switch (getLockAcquireOutcome(ack)) {
        case LOCK_ACQUIRE_OUTCOME.NETWORK:
            return RETRY;
        case LOCK_ACQUIRE_OUTCOME.DENIED:
            return {
                kind: LOCK_RECOVERY.GIVE_UP,
                reason: LOCK_GIVE_UP_REASON.DENIED,
            };
        case LOCK_ACQUIRE_OUTCOME.GRANTED:
            return getGrantedRecovery(publishedVersion, baseVersion);
    }
};
