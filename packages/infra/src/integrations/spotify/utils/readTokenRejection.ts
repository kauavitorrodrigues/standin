import {
    SpotifyAuthorizationDeniedError,
    SpotifyCredentialsInvalidError,
} from "@standin/contracts";
import { SPOTIFY_INVALID_GRANT_ERROR } from "../consts";
import { TokenErrorResponseSchema } from "../schemas";

/**
 * The error for a 400 of the token endpoint. A refused code is the person's
 * authorization that did not hold; anything else (`invalid_client`) is the app
 * that Spotify no longer accepts.
 */
export const readTokenRejection = (
    body: unknown
): SpotifyAuthorizationDeniedError | SpotifyCredentialsInvalidError => {
    const parsed = TokenErrorResponseSchema.safeParse(body);
    if (!parsed.success) return new SpotifyCredentialsInvalidError();
    if (parsed.data.error !== SPOTIFY_INVALID_GRANT_ERROR) {
        return new SpotifyCredentialsInvalidError();
    }

    return new SpotifyAuthorizationDeniedError();
};
