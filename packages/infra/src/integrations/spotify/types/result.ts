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
};
