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
        isDancing: {
            invalid: "The dancing state must be true or false.",
        },
    },
    wave: {
        targetUserId: {
            invalid: "The person to wave to is invalid.",
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
    announcing: {
        announcing: {
            invalid: "The announcing state must be true or false.",
        },
    },
    shareVideo: {
        sharing: {
            invalid: "The video sharing state must be true or false.",
        },
    },
    handRaise: {
        raised: {
            invalid: "The raised hand state must be true or false.",
        },
    },
    status: {
        availability: {
            invalid: "The availability must be active or away.",
        },
        text: {
            invalid: "The status text must have 1 to 80 characters.",
        },
        emoji: {
            invalid: "The status emoji must be a single emoji.",
        },
        expiresAt: {
            invalid: "The status must end in the future, within a day.",
        },
    },
    activeObject: {
        objectId: {
            invalid: "The object must be an id or null.",
        },
    },
    closeObject: {
        objectId: {
            invalid: "The object to close must be an id.",
        },
    },
} as const;
