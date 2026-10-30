import { getApiError } from "@/features/assets/utils/getApiError";
import { SERVICE_TOKEN_ERROR_MESSAGES } from "../consts/messages";

// The words of the page for what the API refused, or the fallback.
export const getServiceTokenErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    switch (getApiError(error).code) {
        case "SERVICE_TOKEN_NOT_FOUND":
            return SERVICE_TOKEN_ERROR_MESSAGES.NOT_FOUND;
        case "SERVICE_TOKEN_NOT_ACTIVE":
            return SERVICE_TOKEN_ERROR_MESSAGES.NOT_ACTIVE;
        default:
            return fallback;
    }
};
