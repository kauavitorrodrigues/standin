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
        orAttachmentRequired: "Envie um texto ou pelo menos um anexo.",
    },
    createdAt: {
        invalid: "A data de criação da mensagem é inválida.",
    },
    editedAt: {
        invalid: "A data de edição da mensagem é inválida.",
    },
    contentOrAttachment: {
        required: "Envie um texto ou pelo menos um anexo.",
    },
};

export const ReactionErrorMessages = {
    emoji: {
        required: "Selecione um emoji para reagir.",
        max: `O emoji não pode ter mais de ${MAX_REACTION_EMOJI_LENGTH} caracteres.`,
        invalid: "A reação precisa ser um emoji.",
    },
};

export const DirectConversationErrorMessages = {
    recipientUserId: {
        required: "Selecione com quem você quer conversar.",
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
