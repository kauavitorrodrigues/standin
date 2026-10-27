import { useMemo } from "react";
import type { useSpaceConnection } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import type { ChatPageContextType } from "@/features/chat/contexts/ChatPageContext";
import type { PeerChatContextType } from "@/features/chat/contexts/PeerChatContext";
import type { PeerTypingContextType } from "@/features/chat/contexts/PeerTypingContext";
import type { TypingByConversation } from "@/features/chat/utils/typingByConversation";

type PeerChatContextValuesOptions = Pick<
    ReturnType<typeof useSpaceConnection>,
    "sendChatTyping"
> & {
    typingByConversation: TypingByConversation;
    onlineUserIds: ChatPageContextType["onlineUserIds"];
    getConversationLink: ChatPageContextType["getConversationLink"];
};

// The three values the chat page reads from context, built from what the
// space connection sends.
export const usePeerChatContextValues = ({
    typingByConversation,
    onlineUserIds,
    getConversationLink,
    sendChatTyping,
}: PeerChatContextValuesOptions) => {
    const peerChat: PeerChatContextType = useMemo(
        () => ({ broadcastTyping: sendChatTyping }),
        [sendChatTyping]
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
