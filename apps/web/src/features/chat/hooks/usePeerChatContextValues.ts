import { useMemo } from "react";
import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import type { ChatPageContextType } from "@/features/chat/contexts/ChatPageContext";
import type { PeerChatContextType } from "@/features/chat/contexts/PeerChatContext";
import type { PeerTypingContextType } from "@/features/chat/contexts/PeerTypingContext";
import type { TypingByConversation } from "@/features/chat/utils/typingByConversation";

type Broadcasts = Pick<
    ReturnType<typeof useSpaceConnection>,
    | "broadcastChatMessage"
    | "broadcastTyping"
    | "broadcastReaction"
    | "broadcastEdit"
    | "broadcastDelete"
    | "broadcastConfirm"
>;

type PeerChatContextValuesOptions = Broadcasts & {
    user: { id: string; name: string };
    typingByConversation: TypingByConversation;
    onlineUserIds: ChatPageContextType["onlineUserIds"];
    getConversationLink: ChatPageContextType["getConversationLink"];
};

// The three values the chat page reads from context, built from what the
// space connection broadcasts.
export const usePeerChatContextValues = ({
    user,
    typingByConversation,
    onlineUserIds,
    getConversationLink,
    broadcastChatMessage,
    broadcastTyping,
    broadcastReaction,
    broadcastEdit,
    broadcastDelete,
    broadcastConfirm,
}: PeerChatContextValuesOptions) => {
    const peerChat: PeerChatContextType = useMemo(
        () => ({
            broadcastChatMessage: (conversationId, message) => {
                // seenBy never travels over the peer mesh (read receipts are
                // API-only). Stripped here, the one place that turns a
                // cached MessageWithDetails into a wire payload.
                const { seenBy: _seenBy, ...peerMessage } = message;
                broadcastChatMessage({
                    conversationId,
                    message: peerMessage,
                    senderName: user.name,
                });
            },
            broadcastTyping: (conversationId, isTyping) =>
                broadcastTyping({
                    conversationId,
                    userId: user.id,
                    userName: user.name,
                    isTyping,
                }),
            broadcastReaction: (conversationId, messageId, emoji, added) =>
                broadcastReaction({
                    conversationId,
                    messageId,
                    emoji,
                    userId: user.id,
                    added,
                }),
            broadcastEdit: (conversationId, messageId, content, editedAt) =>
                broadcastEdit({
                    conversationId,
                    messageId,
                    userId: user.id,
                    content,
                    editedAt,
                }),
            broadcastDelete: (conversationId, messageId) =>
                broadcastDelete({ conversationId, messageId, userId: user.id }),
            broadcastConfirm: (conversationId, tempId, message) => {
                const { seenBy: _seenBy, ...peerMessage } = message;
                broadcastConfirm({
                    conversationId,
                    tempId,
                    message: peerMessage,
                });
            },
        }),
        [
            broadcastChatMessage,
            broadcastTyping,
            broadcastReaction,
            broadcastEdit,
            broadcastDelete,
            broadcastConfirm,
            user.id,
            user.name,
        ]
    );

    // Kept out of peerChat (see PeerTypingContext) so a peer's typing
    // activity only re-renders TypingIndicator, not every message-list
    // consumer of PeerChatContext.
    const peerTyping: PeerTypingContextType = useMemo(
        () => ({
            getTypingUsers: (conversationId) =>
                Object.entries(typingByConversation[conversationId] ?? {}).map(
                    ([userId, userName]) => ({ userId, userName })
                ),
        }),
        [typingByConversation]
    );

    const chatPage: ChatPageContextType = useMemo(
        () => ({ onlineUserIds, getConversationLink }),
        [onlineUserIds, getConversationLink]
    );

    return { peerChat, peerTyping, chatPage };
};
