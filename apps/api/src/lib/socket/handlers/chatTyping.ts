import type { Socket } from "socket.io";
import { ChatEvents, ChatTypingSchema } from "@standin/contracts";
import { resolveCachedConversationRecipients } from "@/features/chat/utils/resolveConversationRecipients";
import { SocketManager } from "../socketManager";
import { resolveSpaceOrganizationId } from "../services/resolveSpaceOrganizationId";
import { resolveUserProfile } from "../services/resolveUserProfile";

// Someone is typing in a conversation of an organization. The server checks
// that they may be in it, and tells the other people of it. The name is the one of the account the socket authenticated, never one
// the client wrote.
export function registerChatTyping(socket: Socket) {
    socket.on(ChatEvents.TYPING, async (payload) => {
        try {
            const parsed = ChatTypingSchema.safeParse(payload);
            if (!parsed.success) return;

            const { conversationId, isTyping } = parsed.data;
            const userId = socket.data.userId as string;

            // Inside a space the space decides the organization. Outside one the
            // client names it, and the check of access below holds either way.
            const { spaceId } = socket.data;
            const organizationId = spaceId
                ? await resolveSpaceOrganizationId(spaceId)
                : parsed.data.organizationId;
            if (!organizationId) return;

            const recipients = await resolveCachedConversationRecipients(
                conversationId,
                organizationId,
                userId
            );
            if (!recipients) return;

            const { name: userName } = await resolveUserProfile(userId);
            if (!userName) return;

            recipients.forEach((recipientId) => {
                SocketManager.emitToNotify(recipientId, ChatEvents.TYPING, {
                    conversationId,
                    isTyping,
                    userId,
                    userName,
                });
            });
        } catch (error) {
            console.error(error);
        }
    });
}
