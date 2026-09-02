export const GameErrorMessages = {
    spaceJoin: {
        organizationId: {
            required: "O identificador da organização é obrigatório.",
        },
        spaceId: {
            required: "O identificador do space é obrigatório.",
        },
        userId: {
            required: "O identificador do usuário é obrigatório.",
        },
    },
    webrtcSignal: {
        targetSocketId: {
            required: "O socket de destino é obrigatório.",
        },
    },
} as const;
