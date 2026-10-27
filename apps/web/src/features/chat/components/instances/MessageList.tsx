import { useCallback, useMemo, useState, type UIEvent } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatQueries } from "@/features/chat/queries";
import { ChatMutations } from "@/features/chat/mutations";
import { Content } from "@/features/chat/components/views/messages/Content";
import { DeleteMessageDialog } from "@/features/chat/components/dialogs/DeleteMessageDialog";
import { MessageListContext } from "@/features/chat/contexts/MessageListContext";
import { useMessageGroups } from "@/features/chat/utils/useMessageGroups";
import { useMessageAnimationFlags } from "@/features/chat/utils/useMessageAnimationFlags";
import { LOAD_MORE_SCROLL_THRESHOLD_PX } from "@/features/chat/consts/messages";

type Props = {
    conversationId: string;
    hasSingleViewer: boolean;
    // Lists the replies of that message instead of the conversation.
    threadParentId?: string;
    // Absent when this list has no thread panel to open.
    onOpenThread?: (messageId: string) => void;
};

export const MessageList = ({
    conversationId,
    hasSingleViewer,
    threadParentId,
    onOpenThread,
}: Props) => {
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
    } = ChatQueries.useMessages(conversationId, threadParentId);

    const groups = useMessageGroups(messages);
    const { newMessageIds, editedMessageIds } =
        useMessageAnimationFlags(messages, isLoading);

    // Only one message can ever be mid-delete at a time for this client, so
    // its confirmation dialog is a single instance here instead of one
    // mounted per message row (see MessageLineContent/DeleteMessageDialog).
    const [deletingMessage, setDeletingMessage] =
        useState<MessageWithDetails | null>(null);

    const handleViewportScroll = (event: UIEvent<HTMLDivElement>) => {
        const isNearTop =
            event.currentTarget.scrollTop < LOAD_MORE_SCROLL_THRESHOLD_PX;
        if (isNearTop && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Stable identity, along with onRequestDelete below: passed down through
    // Content/MessageGroupList to every MessageGroup, and a fresh function
    // every render would defeat React.memo(MessageGroup) for all of them.
    const handleToggleReaction = useCallback(
        (messageId: string, emoji: string, reactedByMe: boolean) => {
            toggleReaction.mutate({
                conversationId,
                messageId,
                threadParentId,
                emoji,
                reactedByMe,
            });
        },
        [conversationId, threadParentId, toggleReaction]
    );

    const handleRequestDelete = useCallback((message: MessageWithDetails) => {
        setDeletingMessage(message);
    }, []);

    const listContext = useMemo(
        () => ({ threadParentId, onOpenThread }),
        [threadParentId, onOpenThread]
    );

    return (
        <MessageListContext.Provider value={listContext}>
            <Content
                groups={groups}
                users={users}
                currentUser={user}
                hasSingleViewer={hasSingleViewer}
                newMessageIds={newMessageIds}
                editedMessageIds={editedMessageIds}
                isLoading={isLoading}
                isError={isError}
                onViewportScroll={handleViewportScroll}
                onToggleReaction={handleToggleReaction}
                onRequestDelete={handleRequestDelete}
            />
            <DeleteMessageDialog
                message={deletingMessage}
                open={deletingMessage !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingMessage(null);
                }}
            />
        </MessageListContext.Provider>
    );
};
