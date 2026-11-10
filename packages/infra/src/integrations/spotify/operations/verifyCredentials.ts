import {
    SpotifyCredentialsInvalidError,
    SpotifyUnavailableError,
} from "@standin/contracts";
import {
    SPOTIFY_GRANT_TYPES,
    SPOTIFY_OK_STATUS,
    SPOTIFY_REJECTED_CREDENTIALS_STATUSES,
} from "../consts";
import type { SpotifyCredentials } from "../types";
import { requestToken } from "../utils/requestToken";

/**
 * Asks Spotify for an app token with the pair, which needs no person. A pair
 * Spotify refuses is a `SpotifyCredentialsInvalidError`; any other failure is
 * `SpotifyUnavailableError`. It cannot tell if the owner has Premium or who is
 * on the list of the app, that only shows when a person connects.
 */
export const verifyCredentials = async (
    credentials: SpotifyCredentials
): Promise<void> => {
    const { status } = await requestToken(credentials, {
        grant_type: SPOTIFY_GRANT_TYPES.CLIENT_CREDENTIALS,
    });

    if (status === SPOTIFY_OK_STATUS) return;
    if (SPOTIFY_REJECTED_CREDENTIALS_STATUSES.has(status)) {
        throw new SpotifyCredentialsInvalidError();
    }
    throw new SpotifyUnavailableError();
};
