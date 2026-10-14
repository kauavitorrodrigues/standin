import { getApiError } from "@/features/assets/utils/getApiError";
import { TEMPLATE_API_ERROR_CODES } from "../consts/apiErrorCodes";
import { TEMPLATE_MESSAGES } from "../consts/messages";

// The message for a failed delete: 409 (not deletable), 423 (map locked by
// someone editing) or the generic one.
export const getDeleteErrorMessage = (error: unknown): string => {
    const { status, code } = getApiError(error);
    switch (status) {
        case 409:
            if (code === TEMPLATE_API_ERROR_CODES.NOT_DELETABLE) {
                return TEMPLATE_MESSAGES.DELETE_PUBLISHED;
            }
            return TEMPLATE_MESSAGES.DELETE_FAILED;
        case 423:
            if (code === TEMPLATE_API_ERROR_CODES.MAP_LOCKED) {
                return TEMPLATE_MESSAGES.DELETE_LOCKED;
            }
            return TEMPLATE_MESSAGES.DELETE_FAILED;
        default:
            return TEMPLATE_MESSAGES.DELETE_FAILED;
    }
};
