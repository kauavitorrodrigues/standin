import { EDIT_SCOPES } from "@standin/contracts";
import {
    DECORATOR_DENIED_MESSAGES,
    DECORATOR_MESSAGES,
} from "@/features/decorator/consts/messages";
import type { LockStatus } from "@/features/editor/types/lock-status";

type DeniedLock = Extract<LockStatus, { code: string }>;

const describeBusy = (lock: DeniedLock): string => {
    const holder = lock.by?.name || DECORATOR_MESSAGES.HOLDER_FALLBACK;

    switch (lock.mode) {
        case EDIT_SCOPES.MAP:
            return DECORATOR_DENIED_MESSAGES.editing(holder);
        default:
            return DECORATOR_DENIED_MESSAGES.decorating(holder);
    }
};

// Why the decorator did not open. Someone else decorating and the owner
// editing the space are told apart by the mode of the lock that refused.
export const getDeniedDescription = (lock: DeniedLock): string => {
    switch (lock.code) {
        case "FORBIDDEN":
            return DECORATOR_DENIED_MESSAGES.FORBIDDEN;
        case "MAP_LOCKED":
            return describeBusy(lock);
    }
};
