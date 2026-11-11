import { SpotifyProvider } from "@standin/infra";
import {
    SEAL_CONTEXTS,
    openToken,
    sealToken,
} from "../../../../../../lib/crypto";
import { SpotifyRepository } from "../../repository";
import type { PlaybackAccess } from "../../types";
import { rememberAccessToken } from "./accessTokens";

/**
 * Trades the refresh token for a new access token and keeps it in memory.
 * Null when the sealed token cannot be opened (the server secret changed).
 */
export const renewAccessToken = async ({
    key,
    credentials,
    refreshTokenSealed,
}: PlaybackAccess): Promise<string | null> => {
    const refreshToken = openToken(
        refreshTokenSealed,
        SEAL_CONTEXTS.INTEGRATION
    );
    if (!refreshToken) return null;

    const tokens = await SpotifyProvider.refreshAccessToken({
        credentials,
        refreshToken,
    });
    rememberAccessToken(key, tokens.accessToken);

    // Spotify may rotate the refresh token, and the old one stops working.
    if (tokens.refreshToken) {
        await SpotifyRepository.updateRefreshToken(
            key,
            sealToken(tokens.refreshToken, SEAL_CONTEXTS.INTEGRATION)
        );
    }

    return tokens.accessToken;
};
