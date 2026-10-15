import { getApiError } from "@/features/assets/utils/getApiError";
import type { PublishIssue } from "@standin/contracts";
import { PUBLISH_ERROR_KIND, PUBLISH_HTTP_STATUS } from "@/features/editor/consts/publish";
import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";

// A request that never got an answer (network) has no status and is retried.
// Any 5xx is retried too. Every other status is final.
const classifyOtherStatus = (status: number | null): ClassifiedPublishError => {
    switch (status) {
        case null:
            return { kind: PUBLISH_ERROR_KIND.RETRYABLE };
        default:
            return status >= PUBLISH_HTTP_STATUS.SERVER_ERROR_FROM
                ? { kind: PUBLISH_ERROR_KIND.RETRYABLE }
                : { kind: PUBLISH_ERROR_KIND.UNKNOWN };
    }
};

export const classifyPublishError = (
    error: unknown
): ClassifiedPublishError => {
    const { status, errors } = getApiError(error);

    switch (status) {
        case PUBLISH_HTTP_STATUS.UNPROCESSABLE:
            return {
                kind: PUBLISH_ERROR_KIND.VALIDATION,
                issues: errors as unknown as PublishIssue[],
            };
        case PUBLISH_HTTP_STATUS.CONFLICT:
            return { kind: PUBLISH_ERROR_KIND.STALE };
        case PUBLISH_HTTP_STATUS.LOCKED:
            return { kind: PUBLISH_ERROR_KIND.LOCK_LOST };
        default:
            return classifyOtherStatus(status);
    }
};
