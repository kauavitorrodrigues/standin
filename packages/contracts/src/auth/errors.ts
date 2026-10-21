import { BaseError } from "../errors/base";
import { OAUTH_ERROR_CODES } from "./consts/oauth-error-codes";

// The `state` of the callback is missing, expired or different from the one in
// the cookie.
export class OAuthStateInvalidError extends BaseError {
    constructor() {
        super(
            "The sign in request is invalid or expired.",
            OAUTH_ERROR_CODES.STATE_INVALID,
            400
        );
    }
}

// The person refused the authorization on the provider page.
export class OAuthAccessDeniedError extends BaseError {
    constructor() {
        super(
            "The authorization was denied on the provider.",
            OAUTH_ERROR_CODES.ACCESS_DENIED,
            400
        );
    }
}

// The instance has no credentials for this provider.
export class OAuthProviderDisabledError extends BaseError {
    constructor() {
        super(
            "Sign in with this provider is not enabled.",
            OAUTH_ERROR_CODES.PROVIDER_DISABLED,
            404
        );
    }
}

// The provider has no verified primary e-mail for the person.
export class OAuthEmailUnverifiedError extends BaseError {
    constructor() {
        super(
            "The provider has no verified primary e-mail for this account.",
            OAUTH_ERROR_CODES.EMAIL_UNVERIFIED,
            422
        );
    }
}

// The code exchange or a call to the provider failed.
export class OAuthExchangeFailedError extends BaseError {
    constructor() {
        super(
            "The provider could not complete the sign in.",
            OAUTH_ERROR_CODES.EXCHANGE_FAILED,
            502
        );
    }
}
