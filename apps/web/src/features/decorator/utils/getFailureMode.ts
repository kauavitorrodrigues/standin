import { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";
import type { PublishPhase } from "@/features/editor/types/publish-phase";
import { DECORATOR_FAILURE_MODES } from "@/features/decorator/consts/failure-modes";
import type { DecoratorFailureMode } from "@/features/decorator/types/failure-mode";

const describeFailure = (
    failure: ClassifiedPublishError
): DecoratorFailureMode | null => {
    switch (failure.kind) {
        case PUBLISH_ERROR_KIND.VALIDATION:
            return DECORATOR_FAILURE_MODES.VALIDATION;
        case PUBLISH_ERROR_KIND.STALE:
            return DECORATOR_FAILURE_MODES.STALE;
        case PUBLISH_ERROR_KIND.RETRYABLE:
            return DECORATOR_FAILURE_MODES.NETWORK;
        case PUBLISH_ERROR_KIND.UNKNOWN:
            return DECORATOR_FAILURE_MODES.FAILED;
        case PUBLISH_ERROR_KIND.LOCK_LOST:
            // The lock notice speaks for it, there is no dialog.
            return null;
    }
};

// What the dialog of a failed apply says, or null while there is no failure
// to show (no failure, or the lock that was lost).
export const getFailureMode = (
    phase: PublishPhase,
    failure: ClassifiedPublishError | null
): DecoratorFailureMode | null => {
    if (phase !== PUBLISH_PHASE.ERROR || !failure) return null;

    return describeFailure(failure);
};
