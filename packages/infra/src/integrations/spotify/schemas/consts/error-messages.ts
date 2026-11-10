// What a malformed answer of Spotify is called in the log. They never reach the
// person, who only sees that Spotify could not be reached.
export const SpotifyResponseErrorMessages = {
    accessToken: {
        required: "Spotify did not send an access token.",
    },
    refreshToken: {
        required: "Spotify did not send a refresh token.",
    },
    scope: {
        invalid: "Spotify sent an invalid scope.",
    },
    error: {
        invalid: "Spotify sent an invalid error code.",
    },
    profile: {
        id: "Spotify did not send the id of the account.",
    },
};
