import { useMemo, type UIEvent } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatQueries } from "@/features/chat/queries";
import { ChatMutations } from "@/features/chat/mutations";
import { Content } from "@/features/chat/components/views/messages/Content";
import { groupMessagesBySender } from "@/features/chat/utils/groupMessagesBySender";
import { LOAD_MORE_SCROLL_THRESHOLD_PX } from "@/features/chat/consts/messages";

type Props = { conversationId: string };

export const MessageList = ({ conversationId }: Props) => {
    const { user } = useAuth();
    const toggleReaction = ChatMutations.toggleReaction();

    const {
        messages,
        users,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = ChatQueries.useMessages(conversationId);

    const groups = useMemo(() => groupMessagesBySender(messages), [messages]);

    const handleViewportScroll = (event: UIEvent<HTMLDivElement>) => {
        const isNearTop =
            event.currentTarget.scrollTop < LOAD_MORE_SCROLL_THRESHOLD_PX;
        if (isNearTop && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    return (
        <Content
            groups={groups}
            users={users}
            currentUser={user}
            isLoading={isLoading}
            isError={isError}
            onViewportScroll={handleViewportScroll}
            onToggleReaction={(messageId, emoji, reactedByMe) =>
                toggleReaction.mutate({
                    conversationId,
                    messageId,
                    emoji,
                    reactedByMe,
                })
            }
        />
    );
};
