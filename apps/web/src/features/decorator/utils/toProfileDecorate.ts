import type { ProfileDecorate } from "@/features/users/types/profileDecorate";
import { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";

// The Decorar button of the profile card for what the entries do right now:
// no button when hidden, an off one with the reason when blocked.
export const toProfileDecorate = (
    availability: DecorateAvailability,
    onDecorate: () => void
): ProfileDecorate | undefined => {
    switch (availability.kind) {
        case DECORATE_AVAILABILITY.HIDDEN:
            return undefined;
        case DECORATE_AVAILABILITY.BLOCKED:
            return { onDecorate, disabledReason: availability.reason };
        case DECORATE_AVAILABILITY.ENABLED:
            return { onDecorate, disabledReason: null };
    }
};
