import type { SpotifyConnectionKey } from "../../types";

// Spotify access tokens last about an hour and are never stored: the server
// keeps the last one of each person in memory, so a poll does not refresh
// the token every time. A 401 or a restart simply asks for a new one.
const tokens = new Map<string, string>();

const toCacheKey = ({ organizationId, userId }: SpotifyConnectionKey) =>
    `${organizationId}:${userId}`;

export const recallAccessToken = (key: SpotifyConnectionKey) =>
    tokens.get(toCacheKey(key)) ?? null;

export const rememberAccessToken = (
    key: SpotifyConnectionKey,
    accessToken: string
) => {
    tokens.set(toCacheKey(key), accessToken);
};

export const forgetAccessToken = (key: SpotifyConnectionKey) => {
    tokens.delete(toCacheKey(key));
};
