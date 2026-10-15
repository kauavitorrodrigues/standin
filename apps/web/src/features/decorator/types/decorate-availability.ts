import type { MapLockState } from "@standin/contracts";
import type { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";

export type DecorateAvailability =
    | { kind: typeof DECORATE_AVAILABILITY.HIDDEN }
    | { kind: typeof DECORATE_AVAILABILITY.ENABLED }
    | { kind: typeof DECORATE_AVAILABILITY.BLOCKED; reason: string };

export type GetDecorateAvailabilityInput = {
    canDecorate: boolean;
    lock: MapLockState;
    userId: string;
};
