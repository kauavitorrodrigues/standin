import type { SpotifyCredentials } from "@standin/infra";

export type SaveSpotifyAppInput = {
    organizationId: string;
    userId: string;
    clientId: string;
    clientSecret: string;
};

export type StartSpotifyConnectionInput = {
    organizationId: string;
    userId: string;
    redirectUri: string;
    state: string;
};

export type CompleteSpotifyConnectionInput = {
    organizationId: string;
    userId: string;
    redirectUri: string;
    code: string;
};

export type SpotifyConnectionKey = {
    organizationId: string;
    userId: string;
};

// What a read of the playback needs to get an access token: the person, the
// app of the organization and the refresh token still sealed.
export type PlaybackAccess = {
    key: SpotifyConnectionKey;
    credentials: SpotifyCredentials;
    refreshTokenSealed: string;
};
