import {
    MAX_MESSAGE_CONTENT_LENGTH,
    MAX_REACTION_EMOJI_LENGTH,
} from "./fields";

export const MessageErrorMessages = {
    id: {
        invalid: "O ID da mensagem é inválido.",
    },
    conversationId: {
        invalid: "O ID da conversa é inválido.",
    },
    senderId: {
        invalid: "O ID do remetente é inválido.",
    },
    content: {
        required: "O conteúdo da mensagem é obrigatório.",
        max: `A mensagem não pode ter mais de ${MAX_MESSAGE_CONTENT_LENGTH} caracteres.`,
    },
    createdAt: {
        invalid: "A data de criação da mensagem é inválida.",
    },
    editedAt: {
        invalid: "A data de edição da mensagem é inválida.",
    },
};

export const ReactionErrorMessages = {
    emoji: {
        required: "Selecione um emoji para reagir.",
        max: `O emoji não pode ter mais de ${MAX_REACTION_EMOJI_LENGTH} caracteres.`,
    },
};
