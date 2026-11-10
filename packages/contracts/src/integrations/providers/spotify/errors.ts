import { BaseError } from "../../../errors/base";

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
            "SPOTIFY_CREDENTIALS_INVALID",
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
            "SPOTIFY_ACCOUNT_NOT_ALLOWED",
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
