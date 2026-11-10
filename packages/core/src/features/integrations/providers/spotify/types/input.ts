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
