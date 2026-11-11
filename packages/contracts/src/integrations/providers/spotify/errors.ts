import { BaseError } from "../../../errors/base";

// The codes a caller branches on with a `switch`.
export const SPOTIFY_ERROR_CODES = {
    CREDENTIALS_INVALID: "SPOTIFY_CREDENTIALS_INVALID",
    ACCOUNT_NOT_ALLOWED: "SPOTIFY_ACCOUNT_NOT_ALLOWED",
    ACCESS_REVOKED: "SPOTIFY_ACCESS_REVOKED",
    ACCESS_TOKEN_EXPIRED: "SPOTIFY_ACCESS_TOKEN_EXPIRED",
} as const;

export class SpotifyNotConfiguredError extends BaseError {
    constructor() {
        super(
            "This organization has not set up Spotify.",
            "SPOTIFY_NOT_CONFIGURED",
            404
        );
    }
}

export class SpotifyCredentialsInvalidError extends BaseError {
    constructor() {
        super(
            "Spotify did not accept this client ID and secret.",
            SPOTIFY_ERROR_CODES.CREDENTIALS_INVALID,
            422
        );
    }
}

export class SpotifyConnectionLimitError extends BaseError {
    constructor() {
        super(
            "All the places of this Spotify app are taken.",
            "SPOTIFY_CONNECTION_LIMIT",
            409
        );
    }
}

// Spotify answers 403 to an account that is not on the list of the app.
export class SpotifyAccountNotAllowedError extends BaseError {
    constructor() {
        super(
            "This Spotify account is not on the list of the Spotify app. Ask the owner of the organization to add it.",
            SPOTIFY_ERROR_CODES.ACCOUNT_NOT_ALLOWED,
            403
        );
    }
}

export class SpotifyAuthorizationDeniedError extends BaseError {
    constructor() {
        super(
            "The Spotify authorization was not given.",
            "SPOTIFY_AUTHORIZATION_DENIED",
            403
        );
    }
}

export class SpotifyStateInvalidError extends BaseError {
    constructor() {
        super(
            "The Spotify connection attempt is not valid or has expired.",
            "SPOTIFY_STATE_INVALID",
            400
        );
    }
}

export class SpotifyUnavailableError extends BaseError {
    constructor() {
        super("Spotify could not be reached.", "SPOTIFY_UNAVAILABLE", 502);
    }
}

export class SpotifyConnectionNotFoundError extends BaseError {
    constructor() {
        super(
            "Spotify connection not found.",
            "SPOTIFY_CONNECTION_NOT_FOUND",
            404
        );
    }
}

// The person took the access back in their Spotify account, so the refresh
// token no longer works.
export class SpotifyAccessRevokedError extends BaseError {
    constructor() {
        super(
            "The person removed the access to Spotify.",
            SPOTIFY_ERROR_CODES.ACCESS_REVOKED,
            403
        );
    }
}

// The access token ran out. The caller refreshes it and asks again.
export class SpotifyAccessTokenExpiredError extends BaseError {
    constructor() {
        super(
            "The Spotify access token expired.",
            SPOTIFY_ERROR_CODES.ACCESS_TOKEN_EXPIRED,
            401
        );
    }
}

// Spotify asked us to slow down. `retryAfterMs` is how long to wait.
export class SpotifyRateLimitedError extends BaseError {
    public readonly retryAfterMs: number | null;

    constructor(retryAfterMs: number | null) {
        super("Spotify is limiting the requests.", "SPOTIFY_RATE_LIMITED", 429);
        this.retryAfterMs = retryAfterMs;
    }
}
