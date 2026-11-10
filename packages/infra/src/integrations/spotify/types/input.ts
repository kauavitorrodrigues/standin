// The app of an organization. It comes from the database on each call: the
// provider keeps no state and reads no environment variable.
export type SpotifyCredentials = {
    clientId: string;
    clientSecret: string;
};

export type GetAuthUrlInput = {
    credentials: SpotifyCredentials;
    redirectUri: string;
    state: string;
};

export type ExchangeCodeInput = {
    credentials: SpotifyCredentials;
    redirectUri: string;
    code: string;
};
