import { getApiError } from "@/features/assets/utils/getApiError";
import { TEMPLATE_API_ERROR_CODES } from "../consts/apiErrorCodes";
import { TEMPLATE_MESSAGES } from "../consts/messages";

// The message for a failed publish: the rule of the server that refused it,
// or the generic one.
export const getPublishErrorMessage = (error: unknown): string => {
    const { status, code } = getApiError(error);
    switch (code) {
        case TEMPLATE_API_ERROR_CODES.NOT_DRAFT:
            return TEMPLATE_MESSAGES.PUBLISH_NOT_DRAFT;
        case TEMPLATE_API_ERROR_CODES.THUMBNAIL_REQUIRED:
            return TEMPLATE_MESSAGES.PUBLISH_THUMBNAIL_REQUIRED;
        case TEMPLATE_API_ERROR_CODES.USES_NON_GLOBAL_ASSET:
            return TEMPLATE_MESSAGES.PUBLISH_PRIVATE_ASSETS;
    }
    switch (status) {
        case 422:
            return TEMPLATE_MESSAGES.PUBLISH_INVALID_LAYOUT;
        default:
            return TEMPLATE_MESSAGES.PUBLISH_FAILED;
    }
};
