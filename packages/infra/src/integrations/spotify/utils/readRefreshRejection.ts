import {
    SpotifyAccessRevokedError,
    SpotifyCredentialsInvalidError,
} from "@standin/contracts";
import { SPOTIFY_INVALID_GRANT_ERROR } from "../consts";
import { TokenErrorResponseSchema } from "../schemas";

/**
 * The error for a 400 of the token endpoint on a refresh. `invalid_grant` is
 * a refresh token that was revoked or replaced; anything else
 * (`invalid_client`) is the app that Spotify no longer accepts.
 */
export const readRefreshRejection = (
    body: unknown
): SpotifyAccessRevokedError | SpotifyCredentialsInvalidError => {
    const parsed = TokenErrorResponseSchema.safeParse(body);
    if (!parsed.success) return new SpotifyCredentialsInvalidError();
    if (parsed.data.error !== SPOTIFY_INVALID_GRANT_ERROR) {
        return new SpotifyCredentialsInvalidError();
    }

    return new SpotifyAccessRevokedError();
};
