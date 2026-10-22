export const GameErrorMessages = {
    spaceJoin: {
        spaceId: {
            required: "The space identifier is required.",
        },
    },
    mapJoin: {
        mapId: {
            required: "The map identifier is required.",
        },
    },
    room: {
        roomKey: {
            required: "The room key is required.",
        },
        direction: {
            invalid: "The crossing direction is invalid.",
        },
        userId: {
            required: "The user identifier is required.",
        },
        accept: {
            invalid: "The answer must be true or false.",
        },
    },
    webrtcSignal: {
        targetSocketId: {
            required: "The target socket is required.",
        },
    },
} as const;
