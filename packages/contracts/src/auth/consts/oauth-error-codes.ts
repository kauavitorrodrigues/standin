// Fixed codes the web login page receives in `?error=`. They never carry the
// message of the provider.
export const OAUTH_ERROR_CODES = {
    STATE_INVALID: "oauth_state_invalid",
    ACCESS_DENIED: "oauth_access_denied",
    EMAIL_UNVERIFIED: "github_email_unverified",
    EXCHANGE_FAILED: "oauth_exchange_failed",
    SIGN_IN_FAILED: "oauth_sign_in_failed",
    PROVIDER_DISABLED: "oauth_provider_disabled",
    SIGNUP_CLOSED: "signup_closed",
} as const;
