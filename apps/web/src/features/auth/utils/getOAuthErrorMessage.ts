import { OAUTH_ERROR_CODES } from "@standin/contracts";
import { OAUTH_ERROR_MESSAGES } from "../consts/messages";

/** The message for the code the API put in `?error=`. */
export const getOAuthErrorMessage = (code: string): string => {
    switch (code) {
        case OAUTH_ERROR_CODES.STATE_INVALID:
            return OAUTH_ERROR_MESSAGES.STATE_INVALID;
        case OAUTH_ERROR_CODES.ACCESS_DENIED:
            return OAUTH_ERROR_MESSAGES.ACCESS_DENIED;
        case OAUTH_ERROR_CODES.EMAIL_UNVERIFIED:
            return OAUTH_ERROR_MESSAGES.EMAIL_UNVERIFIED;
        case OAUTH_ERROR_CODES.EXCHANGE_FAILED:
            return OAUTH_ERROR_MESSAGES.EXCHANGE_FAILED;
        case OAUTH_ERROR_CODES.SIGNUP_CLOSED:
            return OAUTH_ERROR_MESSAGES.SIGNUP_CLOSED;
        default:
            return OAUTH_ERROR_MESSAGES.FALLBACK;
    }
};
