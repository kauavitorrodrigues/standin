import {
    BaseError,
    OAUTH_ERROR_CODES,
    SignupClosedError,
} from "@standin/contracts";

const KNOWN_CODES: string[] = Object.values(OAUTH_ERROR_CODES);

/**
 * The fixed code the login page gets for a failure. Only the OAuth errors
 * carry their own code. Anything else (a database error, a bug) becomes the
 * generic code, so no internal message or provider message leaves the server.
 */
export const resolveOAuthErrorCode = (error: unknown): string => {
    if (error instanceof SignupClosedError)
        return OAUTH_ERROR_CODES.SIGNUP_CLOSED;

    if (error instanceof BaseError && KNOWN_CODES.includes(error.code)) {
        return error.code;
    }

    return OAUTH_ERROR_CODES.SIGN_IN_FAILED;
};
