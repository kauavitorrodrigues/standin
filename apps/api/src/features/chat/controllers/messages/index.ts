import { listMessages } from "./list";
import { createMessage } from "./create";
import { updateMessage } from "./update";
import { deleteMessage } from "./delete";
import { addReaction } from "./reactions/add";
import { removeReaction } from "./reactions/remove";

export const MessageController = {
    list: listMessages,
    create: createMessage,
    update: updateMessage,
    delete: deleteMessage,
    reactions: {
        add: addReaction,
        remove: removeReaction,
    },
};