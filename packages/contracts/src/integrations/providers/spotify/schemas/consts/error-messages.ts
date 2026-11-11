import {
    MAX_SPOTIFY_CLIENT_ID_LENGTH,
    MAX_SPOTIFY_CLIENT_SECRET_LENGTH,
} from "./fields";

export const SpotifyErrorMessages = {
    clientId: {
        required: "The client ID is required.",
        max: `The client ID cannot be longer than ${MAX_SPOTIFY_CLIENT_ID_LENGTH} characters.`,
    },
    clientSecret: {
        required: "The client secret is required.",
        max: `The client secret cannot be longer than ${MAX_SPOTIFY_CLIENT_SECRET_LENGTH} characters.`,
    },
    connection: {
        userId: "The connection person ID is invalid.",
        name: "The connection person name is invalid.",
        imageUrl: "The connection person photo is invalid.",
        connectedAt: "The connection date is invalid.",
    },
    ownerStatus: {
        isConfigured: "The configured flag is invalid.",
        clientId: "The saved client ID is invalid.",
        redirectUri: "The redirect address is invalid.",
        maxConnections: "The connection limit is invalid.",
        connections: "The list of connections is invalid.",
    },
    memberStatus: {
        isAvailable: "The available flag is invalid.",
        isConnected: "The connected flag is invalid.",
        isFull: "The full flag is invalid.",
        needsReconnect: "The reconnect flag is invalid.",
    },
};
