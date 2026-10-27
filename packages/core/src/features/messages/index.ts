import { createMessage } from "./create";
import { updateMessage } from "./update";
import { deleteMessage } from "./delete";
import { getThreadSummary } from "./threads";
import { listMessagesByConversation } from "./listByConversation";

export const MessageService = {
    create: createMessage,
    update: updateMessage,
    delete: deleteMessage,
    listByConversation: listMessagesByConversation,
    threadSummary: getThreadSummary,
};

export * from "./reactions";
export * from "./attachments";
export * from "./reads";
