import type { ComponentType } from "react";
import {
    SPACE_UNAVAILABLE_REASONS,
    type SpaceUnavailableReason,
} from "@/features/spaces/consts/availability";
import {
    SpaceDuplicateSessionState,
    SpaceErrorState,
    SpaceLoadingState,
    SpaceNotFoundState,
} from "@/features/spaces/components/pages/space-page/ContentStates";

export const UNAVAILABLE_STATE_BY_REASON: Record<
    SpaceUnavailableReason,
    ComponentType
> = {
    [SPACE_UNAVAILABLE_REASONS.DUPLICATE_SESSION]: SpaceDuplicateSessionState,
    [SPACE_UNAVAILABLE_REASONS.LOADING]: SpaceLoadingState,
    [SPACE_UNAVAILABLE_REASONS.ERROR]: SpaceErrorState,
    [SPACE_UNAVAILABLE_REASONS.NOT_FOUND]: SpaceNotFoundState,
};
