export const GameErrorMessages = {
    spaceJoin: {
        organizationId: {
            required: "The organization identifier is required.",
        },
        spaceId: {
            required: "The space identifier is required.",
        },
        userId: {
            required: "The user identifier is required.",
        },
    },
    mapJoin: {
        mapId: {
            required: "The map identifier is required.",
        },
    },
    webrtcSignal: {
        targetSocketId: {
            required: "The target socket is required.",
        },
    },
} as const;
