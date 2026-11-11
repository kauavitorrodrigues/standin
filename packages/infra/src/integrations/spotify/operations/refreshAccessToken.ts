import { SpotifyUnavailableError } from "@standin/contracts";
import {
    SPOTIFY_CODE_REJECTED_STATUS,
    SPOTIFY_GRANT_TYPES,
    SPOTIFY_OK_STATUS,
} from "../consts";
import type { RefreshAccessTokenInput, SpotifyRefreshedTokens } from "../types";
import { readRefreshedTokens } from "../utils/readRefreshedTokens";
import { readRefreshRejection } from "../utils/readRefreshRejection";
import { requestToken } from "../utils/requestToken";

/**
 * Trades the refresh token for a new access token. A refresh token Spotify no
 * longer accepts is a `SpotifyAccessRevokedError`; an app it does not accept
 * anymore is a `SpotifyCredentialsInvalidError`.
 */
export const refreshAccessToken = async ({
    credentials,
    refreshToken,
}: RefreshAccessTokenInput): Promise<SpotifyRefreshedTokens> => {
    const { status, body } = await requestToken(credentials, {
        grant_type: SPOTIFY_GRANT_TYPES.REFRESH_TOKEN,
        refresh_token: refreshToken,
    });

    switch (status) {
        case SPOTIFY_OK_STATUS:
            return readRefreshedTokens(body);
        case SPOTIFY_CODE_REJECTED_STATUS:
            throw readRefreshRejection(body);
        default:
            throw new SpotifyUnavailableError();
    }
};
