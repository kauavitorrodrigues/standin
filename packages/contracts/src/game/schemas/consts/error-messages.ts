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
    position: {
        coordinate: {
            invalid: "The coordinate must be a number inside the world.",
        },
        direction: {
            invalid: "The direction is invalid.",
        },
        isSitting: {
            invalid: "The sitting state must be true or false.",
        },
    },
    emote: {
        emoji: {
            invalid: "The emote must be a single emoji.",
        },
        count: {
            invalid: "The emote count is out of range.",
        },
    },
    nearby: {
        text: {
            invalid: "The nearby message is invalid.",
        },
        isTyping: {
            invalid: "The typing state must be true or false.",
        },
    },
    webrtcSignal: {
        targetSocketId: {
            required: "The target socket is required.",
        },
    },
} as const;
