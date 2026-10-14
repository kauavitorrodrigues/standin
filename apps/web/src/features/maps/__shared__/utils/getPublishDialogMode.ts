import {
    PUBLISH_DIALOG_MODE,
    PUBLISH_ERROR_KIND,
} from "@/features/editor/consts/publish";
import { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";
import type { PublishDialogMode } from "@/features/maps/__shared__/types/publish-dialog-mode";
import type { PublishPhase } from "@/features/editor/types/publish-phase";

const getFailureMode = (
    failure: ClassifiedPublishError | null
): PublishDialogMode => {
    switch (failure?.kind) {
        case PUBLISH_ERROR_KIND.VALIDATION:
            return PUBLISH_DIALOG_MODE.VALIDATION;
        case PUBLISH_ERROR_KIND.STALE:
            return PUBLISH_DIALOG_MODE.STALE;
        default:
            return PUBLISH_DIALOG_MODE.FAILED;
    }
};

// What the publish dialog shows for the phase of the publish.
export const getPublishDialogMode = (
    phase: PublishPhase,
    failure: ClassifiedPublishError | null
): PublishDialogMode => {
    switch (phase) {
        case PUBLISH_PHASE.PUBLISHING:
            return PUBLISH_DIALOG_MODE.PUBLISHING;
        case PUBLISH_PHASE.ERROR:
            return getFailureMode(failure);
        default:
            return PUBLISH_DIALOG_MODE.CONFIRM;
    }
};
