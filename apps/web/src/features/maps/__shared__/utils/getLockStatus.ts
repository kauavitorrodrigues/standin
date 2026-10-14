import { LOCK_STATUS } from "@/features/maps/__shared__/consts/lock-status";
import type { LockStatus } from "@/features/maps/__shared__/types/lock-status";
import type { LockStatusInput } from "@/features/maps/__shared__/types/lock-status-input";

export const getLockStatus = ({
    acquireAck,
    lost,
}: LockStatusInput): LockStatus => {
    if (lost) return { status: LOCK_STATUS.LOST };
    if (!acquireAck) return { status: LOCK_STATUS.ACQUIRING };
    if (acquireAck.ok) return { status: LOCK_STATUS.HELD };
    return {
        status: LOCK_STATUS.DENIED,
        code: acquireAck.code,
        by: acquireAck.by,
        since: acquireAck.since,
    };
};
