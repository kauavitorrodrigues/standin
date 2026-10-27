import type { User } from "@standin/contracts";
import { ChatEvents } from "@standin/contracts";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import { useTypingByConversation } from "@/features/chat/hooks/useTypingByConversation";

type PeerChatSyncOptions = {
    userId: User["id"];
};

// Who is typing in each conversation, as the server tells it. Messages, edits,
// deletions and reactions arrive through useChatRealtimeEvents, which lives for
// the whole app, since they matter outside a space too.
export const usePeerChatSync = ({ userId }: PeerChatSyncOptions) => {
    const { typingByConversation, setUserTyping } = useTypingByConversation();

    useSocketEvent(
        ChatEvents.TYPING,
        ({ conversationId, userId: typingUserId, userName, isTyping }) => {
            if (typingUserId === userId) return;
            setUserTyping(conversationId, typingUserId, userName, isTyping);
        }
    );

    return { typingByConversation };
};
