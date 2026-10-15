import { EDIT_SCOPES } from "@standin/contracts";
import { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";
import {
    DECORATE_BLOCKED_MESSAGES,
    DECORATOR_MESSAGES,
} from "@/features/decorator/consts/messages";
import type {
    DecorateAvailability,
    GetDecorateAvailabilityInput,
} from "@/features/decorator/types/decorate-availability";

const blocked = (reason: string): DecorateAvailability => ({
    kind: DECORATE_AVAILABILITY.BLOCKED,
    reason,
});

// Who sees the Decorar entries and whether they work. Without permission they
// are hidden. A lock held by the same person (another tab) still opens, and
// takes the lock over. A lock held by someone else blocks them with the
// reason: another decorator, or the owner in the Studio.
export const getDecorateAvailability = ({
    canDecorate,
    lock,
    userId,
}: GetDecorateAvailabilityInput): DecorateAvailability => {
    if (!canDecorate) return { kind: DECORATE_AVAILABILITY.HIDDEN };
    if (!lock.locked || lock.by?.id === userId) {
        return { kind: DECORATE_AVAILABILITY.ENABLED };
    }

    const holder = lock.by?.name || DECORATOR_MESSAGES.HOLDER_FALLBACK;
    switch (lock.mode) {
        case EDIT_SCOPES.OBJECTS:
            return blocked(DECORATE_BLOCKED_MESSAGES.decorating(holder));
        default:
            return blocked(DECORATE_BLOCKED_MESSAGES.editing(holder));
    }
};
