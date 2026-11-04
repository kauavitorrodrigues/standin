import { ChatEvents } from "@standin/contracts";
import type { Message } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";
import { notifyConversation } from "../../utils/notifyConversation";

export const notifyMessageUpdated = (
    organizationId: string,
    message: Message,
    actorId: string,
    addedUserIds: string[]
): Promise<void> =>
    notifyConversation(
        message.conversationId,
        organizationId,
        actorId,
        (userId) =>
            SocketManager.emitToNotify(userId, ChatEvents.MESSAGE_UPDATED, {
                conversationId: message.conversationId,
                messageId: message.id,
                userId: actorId,
                content: message.content,
                editedAt: message.editedAt ?? message.createdAt,
                mentions: message.mentions,
                // Only who the edit added hears about it: a kept mention
                // does not notify again.
                mentionsMe: addedUserIds.includes(userId),
            })
    );
