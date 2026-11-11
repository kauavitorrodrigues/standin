export const SpotifyRoutes = {
    authorize: "https://accounts.spotify.com/authorize",
    token: "https://accounts.spotify.com/api/token",
    profile: "https://api.spotify.com/v1/me",
    currentlyPlaying: "https://api.spotify.com/v1/me/player/currently-playing",
} as const;
