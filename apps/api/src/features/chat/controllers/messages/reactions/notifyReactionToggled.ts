import { ChatEvents } from "@standin/contracts";
import { SocketManager } from "@/lib/socket/socketManager";
import { notifyConversation } from "../../../utils/notifyConversation";

type ReactionToggle = {
    conversationId: string;
    organizationId: string;
    messageId: string;
    emoji: string;
    actorId: string;
    added: boolean;
};

export const notifyReactionToggled = ({
    conversationId,
    organizationId,
    messageId,
    emoji,
    actorId,
    added,
}: ReactionToggle): Promise<void> =>
    notifyConversation(conversationId, organizationId, actorId, (userId) =>
        SocketManager.emitToNotify(userId, ChatEvents.REACTION_TOGGLED, {
            conversationId,
            messageId,
            emoji,
            userId: actorId,
            added,
        })
    );
