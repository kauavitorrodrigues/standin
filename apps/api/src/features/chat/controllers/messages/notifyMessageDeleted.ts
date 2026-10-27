import { ChatEvents } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";
import { notifyConversation } from "../../utils/notifyConversation";

export const notifyMessageDeleted = (
    conversationId: string,
    organizationId: string,
    messageId: string,
    actorId: string
): Promise<void> =>
    notifyConversation(conversationId, organizationId, actorId, (userId) =>
        SocketManager.emitToNotify(userId, ChatEvents.MESSAGE_DELETED, {
            conversationId,
            messageId,
            userId: actorId,
        })
    );
