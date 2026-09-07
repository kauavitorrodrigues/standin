import { ConversationService } from "@standin/core";
import { ChatEvents } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";

// Best-effort: never awaited by the request/response cycle, and any
// failure here is swallowed. A recipient who never gets this still sees
// the new message on their next explicit fetch, so this can't be allowed
// to fail message creation itself.
export const notifyNewMessage = async (
    conversationId: string,
    organizationId: string,
    senderId: string
): Promise<void> => {
    try {
        const conversation = await ConversationService.findById(
            conversationId,
            organizationId
        );
        const recipientIds = await ConversationService.getRecipientUserIds(
            conversation,
            senderId
        );

        for (const userId of recipientIds) {
            SocketManager.emitToUser(userId, ChatEvents.UNREAD_CHANGED, {
                conversationId,
            });
        }
    } catch (error) {
        console.error(error);
    }
};
