import { addReaction } from "./add";
import { removeReaction } from "./remove";
import { listReactionsByMessageIds } from "./listByMessageIds";

export const MessageReactionService = {
    add: addReaction,
    remove: removeReaction,
    listByMessageIds: listReactionsByMessageIds,
};
