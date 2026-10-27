import { ChatEvents } from "@standin/contracts";
import type {
    MessageSender,
    MessageWithDetails,
    ThreadSummary,
} from "@standin/contracts";
import { ConversationReadService, ConversationService } from "@standin/core";
import { SocketManager } from "@/lib/socket/socketManager";

// The message itself reaches each recipient, so the conversation updates with
// no fetch, and it carries that recipient's unread count for the conversation,
// so the badge updates with no fetch either. The counts for the whole batch of
// recipients come from two queries, so a message costs four queries however
// many people hear it. Access was already checked by the route and by
// MessageService.create, so it is not checked again here. The sender hears
// nothing. Best effort like notifyConversation: a failure is logged and
// swallowed, and whoever misses it sees the change on the next fetch.
export const notifyNewMessage = async (
    conversationId: string,
    organizationId: string,
    sender: MessageSender,
    message: MessageWithDetails,
    threadSummary: ThreadSummary | null = null
): Promise<void> => {
    const { seenBy: _seenBy, ...created } = message;

    try {
        const conversation = await ConversationService.findById(
            conversationId,
            organizationId
        );
        const recipients = await ConversationService.getRecipientUserIds(
            conversation,
            sender.id
        );

        const unreadCounts = await ConversationReadService.countUnreadForUsers(
            conversationId,
            recipients
        );

        recipients.forEach((userId) => {
            SocketManager.emitToNotify(userId, ChatEvents.MESSAGE_CREATED, {
                conversationId,
                message: created,
                sender,
                unreadCount: unreadCounts[userId] ?? 0,
                threadSummary,
            });
        });
    } catch (error) {
        console.error(error);
    }
};
