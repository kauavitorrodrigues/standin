import {
    messagesTable,
    messageAttachmentsTable,
    messageReactionsTable,
} from "@standin/database";

export const messageSelect = {
    id: messagesTable.id,
    conversationId: messagesTable.conversationId,
    senderId: messagesTable.senderId,
    content: messagesTable.content,
    createdAt: messagesTable.createdAt,
    editedAt: messagesTable.editedAt,
};

export const messageAttachmentSelect = {
    id: messageAttachmentsTable.id,
    messageId: messageAttachmentsTable.messageId,
    fileId: messageAttachmentsTable.fileId,
};

export const messageReactionSelect = {
    messageId: messageReactionsTable.messageId,
    emoji: messageReactionsTable.emoji,
    userId: messageReactionsTable.userId,
};
