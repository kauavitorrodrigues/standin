import { createMessage } from "./create";
import { updateMessage } from "./update";
import { deleteMessage } from "./delete";
import { listMessagesByConversation } from "./listByConversation";

export const MessageService = {
    create: createMessage,
    update: updateMessage,
    delete: deleteMessage,
    listByConversation: listMessagesByConversation,
};

export * from "./reactions";
export * from "./attachments";
