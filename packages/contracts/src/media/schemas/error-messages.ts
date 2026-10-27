export const MediaErrorMessages = {
    transport: {
        id: {
            required: "The transport identifier is required.",
        },
        direction: {
            invalid: "The transport direction must be send or recv.",
        },
        rtpCapabilities: {
            invalid: "The RTP capabilities are required to receive.",
        },
        dtlsParameters: {
            invalid: "The DTLS parameters are invalid.",
        },
    },
    produce: {
        source: {
            invalid: "The media source is invalid.",
        },
        rtpParameters: {
            invalid: "The RTP parameters are invalid.",
        },
    },
    producer: {
        id: {
            required: "The producer identifier is required.",
        },
    },
    consumer: {
        id: {
            required: "The consumer identifier is required.",
        },
    },
    focus: {
        invalid: "The focused people are invalid.",
        userId: {
            invalid: "A focused person is invalid.",
        },
        layer: {
            invalid: "The requested video layer is invalid.",
        },
    },
    pins: {
        invalid: "The pinned people are invalid.",
        userId: {
            invalid: "A pinned person is invalid.",
        },
    },
    lowQuality: {
        enabled: {
            invalid: "The low quality flag must be true or false.",
        },
    },
    muted: {
        invalid: "The muted state must be true or false.",
    },
    privacy: {
        headphones: {
            invalid: "The headphones state must be true or false.",
        },
        focus: {
            invalid: "The focus state must be true or false.",
        },
    },
} as const;
