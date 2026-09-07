import { createConversationForSpace } from "./createForSpace";
import { deleteConversationsBySpaceIds } from "./deleteBySpaceIds";
import { findConversationBySpaceId } from "./findBySpaceId";
import { findConversationById } from "./findById";
import { canAccessConversation } from "./canAccess";
import { listConversationParticipants } from "./participants/listByConversation";
import { getConversationRecipientUserIds } from "./getRecipientUserIds";
import { listConversationsForUser } from "./listForUser";
import { findOrCreateDirectConversation } from "./findOrCreateDirect";

export const ConversationService = {
    createForSpace: createConversationForSpace,
    deleteBySpaceIds: deleteConversationsBySpaceIds,
    findBySpaceId: findConversationBySpaceId,
    findById: findConversationById,
    canAccess: canAccessConversation,
    listParticipants: listConversationParticipants,
    getRecipientUserIds: getConversationRecipientUserIds,
    listForUser: listConversationsForUser,
    findOrCreateDirect: findOrCreateDirectConversation,
};

export * from "./reads";
