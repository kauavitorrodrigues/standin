import {
    MAX_MESSAGE_CONTENT_LENGTH,
    MAX_MESSAGE_LIST_LIMIT,
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

export const MessageListQueryErrorMessages = {
    cursor: {
        invalid: "O cursor de paginação é inválido.",
    },
    limit: {
        invalid: "O limite deve ser um número inteiro.",
        min: "O limite deve ser de pelo menos 1.",
        max: `O limite não pode ser maior que ${MAX_MESSAGE_LIST_LIMIT}.`,
    },
};
