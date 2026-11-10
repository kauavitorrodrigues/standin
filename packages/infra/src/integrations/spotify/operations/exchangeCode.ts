import { SpotifyUnavailableError } from "@standin/contracts";
import {
    SPOTIFY_CODE_REJECTED_STATUS,
    SPOTIFY_GRANT_TYPES,
    SPOTIFY_OK_STATUS,
} from "../consts";
import { AuthorizationTokenResponseSchema } from "../schemas";
import type { ExchangeCodeInput, SpotifyTokens } from "../types";
import { readTokenRejection } from "../utils/readTokenRejection";
import { requestToken } from "../utils/requestToken";

/**
 * Trades the code of the callback for the tokens. A code Spotify refuses
 * (used, expired or for another address) is a
 * `SpotifyAuthorizationDeniedError`; an app it does not accept anymore (a
 * secret revoked in the dashboard) is a `SpotifyCredentialsInvalidError`.
 */
export const exchangeCode = async ({
    credentials,
    redirectUri,
    code,
}: ExchangeCodeInput): Promise<SpotifyTokens> => {
    const { status, body } = await requestToken(credentials, {
        grant_type: SPOTIFY_GRANT_TYPES.AUTHORIZATION_CODE,
        code,
        redirect_uri: redirectUri,
    });

    if (status === SPOTIFY_CODE_REJECTED_STATUS) throw readTokenRejection(body);
    if (status !== SPOTIFY_OK_STATUS) throw new SpotifyUnavailableError();

    const parsed = AuthorizationTokenResponseSchema.safeParse(body);
    if (!parsed.success) throw new SpotifyUnavailableError();

    return {
        accessToken: parsed.data.access_token,
        refreshToken: parsed.data.refresh_token,
        scope: parsed.data.scope,
    };
};
