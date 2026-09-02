import { createConversationForSpace } from "./createForSpace";
import { deleteConversationsBySpaceIds } from "./deleteBySpaceIds";

export const ConversationService = {
    createForSpace: createConversationForSpace,
    deleteBySpaceIds: deleteConversationsBySpaceIds,
};
