export type SpotifyProfile = {
    id: string;
    // The photo of the account, when Spotify sends one.
    imageUrl: string | null;
};

export type SpotifyTokens = {
    accessToken: string;
    refreshToken: string;
    scope: string;
};

// What a call to Spotify answered, before it is read as a result.
export type SpotifyResponse = {
    status: number;
    body: unknown;
    // The `Retry-After` header in seconds, when Spotify sent a valid one.
    retryAfterSeconds: number | null;
};

// What a person is playing, before the server decides what to show.
export type SpotifyPlayback = {
    trackId: string;
    title: string;
    artists: string[];
    coverUrl: string | null;
    url: string;
    isPlaying: boolean;
};

// The answer to a refresh. Spotify sends a new refresh token only sometimes.
export type SpotifyRefreshedTokens = {
    accessToken: string;
    refreshToken: string | null;
};
