import { ConversationService } from "@standin/core";
import { ChatEvents } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";

// Best-effort: never awaited by the request/response cycle, and failures
// are swallowed. A recipient who misses this still sees the updated seenBy
// on their next fetch, so this must never fail markConversationAsRead itself.
export const notifyMessagesSeen = async (
    conversationId: string,
    organizationId: string,
    readerId: string
): Promise<void> => {
    try {
        const conversation = await ConversationService.findById(
            conversationId,
            organizationId
        );
        const recipientIds = await ConversationService.getRecipientUserIds(
            conversation,
            readerId
        );

        for (const userId of recipientIds) {
            SocketManager.emitToUser(userId, ChatEvents.MESSAGE_SEEN, {
                conversationId,
            });
        }
    } catch (error) {
        console.error(error);
    }
};
