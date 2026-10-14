import { PUBLISH_ERROR_KIND } from "@/features/maps/__shared__/consts/publish";
import type { ClassifiedPublishError } from "@/features/maps/__shared__/types/publish-error";

// A failure that sending the same request again cannot fix: the operations
// were refused, or the map changed under the draft.
export const needsChangeBeforeRetry = (
    failure: ClassifiedPublishError | null
): boolean => {
    switch (failure?.kind) {
        case PUBLISH_ERROR_KIND.VALIDATION:
        case PUBLISH_ERROR_KIND.STALE:
            return true;
        default:
            return false;
    }
};
