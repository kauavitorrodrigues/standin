import { getApiError } from "@/features/assets/utils/getApiError";
import {
    PROFILE_PICTURE_ERROR_MESSAGES,
    PROFILE_PICTURE_MESSAGES,
} from "../consts/messages";

/** What to tell the person about a refused save or removal of the picture. */
export const getProfilePictureErrorMessage = (
    error: unknown,
    fallback: string = PROFILE_PICTURE_MESSAGES.SAVE_FAILED
): string => {
    switch (getApiError(error).code) {
        case "PROFILE_PICTURE_INVALID":
            return PROFILE_PICTURE_ERROR_MESSAGES.PROFILE_PICTURE_INVALID;
        case "PROFILE_PICTURE_TOO_LARGE":
            return PROFILE_PICTURE_ERROR_MESSAGES.PROFILE_PICTURE_TOO_LARGE;
        case "PROFILE_PICTURE_UNSUPPORTED_MEDIA":
            return PROFILE_PICTURE_ERROR_MESSAGES.PROFILE_PICTURE_UNSUPPORTED_MEDIA;
        default:
            return fallback;
    }
};
