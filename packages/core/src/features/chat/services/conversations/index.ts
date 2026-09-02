import { createConversationForSpace } from "./createForSpace";
import { deleteConversationsBySpaceIds } from "./deleteBySpaceIds";
import { findConversationBySpaceId } from "./findBySpaceId";
import { canAccessConversation } from "./canAccess";

export const ConversationService = {
    createForSpace: createConversationForSpace,
    deleteBySpaceIds: deleteConversationsBySpaceIds,
    findBySpaceId: findConversationBySpaceId,
    canAccess: canAccessConversation,
};
