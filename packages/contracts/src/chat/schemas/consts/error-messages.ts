import {
    MAX_DIRECT_CONVERSATION_MEMBERS,
    MAX_MESSAGE_CONTENT_LENGTH,
    MAX_MESSAGE_LIST_LIMIT,
    MAX_REACTION_EMOJI_LENGTH,
} from "./fields";

export const MessageErrorMessages = {
    id: {
        invalid: "The message ID is invalid.",
    },
    conversationId: {
        invalid: "The conversation ID is invalid.",
    },
    senderId: {
        invalid: "The sender ID is invalid.",
    },
    threadParentId: {
        invalid: "The thread parent ID is invalid.",
    },
    showThreadReplyInChannel: {
        invalid: "The thread reply visibility must be true or false.",
    },
    content: {
        required: "The message content is required.",
        max: `The message cannot be longer than ${MAX_MESSAGE_CONTENT_LENGTH} characters.`,
        orAttachmentRequired: "Envie um texto ou pelo menos um anexo.",
    },
    createdAt: {
        invalid: "The message creation date is invalid.",
    },
    editedAt: {
        invalid: "The message edit date is invalid.",
    },
    contentOrAttachment: {
        required: "Envie um texto ou pelo menos um anexo.",
    },
};

export const ReactionErrorMessages = {
    emoji: {
        required: "Selecione um emoji para reagir.",
        max: `The emoji cannot be longer than ${MAX_REACTION_EMOJI_LENGTH} characters.`,
        invalid: "The reaction must be an emoji.",
    },
};

export const DirectConversationErrorMessages = {
    recipientUserIds: {
        invalid: "The recipients are invalid.",
        max: `A conversation cannot have more than ${MAX_DIRECT_CONVERSATION_MEMBERS} people.`,
    },
};

export const MessageListQueryErrorMessages = {
    threadParentId: {
        invalid: "The thread parent ID is invalid.",
    },
    cursor: {
        invalid: "The pagination cursor is invalid.",
    },
    limit: {
        invalid: "The limit must be an integer.",
        min: "The limit must be at least 1.",
        max: `The limit cannot be greater than ${MAX_MESSAGE_LIST_LIMIT}.`,
    },
};
