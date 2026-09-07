import { useCallback, useState, type UIEvent } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ChatQueries } from "@/features/chat/queries";
import { ChatMutations } from "@/features/chat/mutations";
import { Content } from "@/features/chat/components/views/messages/Content";
import { DeleteMessageDialog } from "@/features/chat/components/dialogs/DeleteMessageDialog";
import { useMessageGroups } from "@/features/chat/utils/useMessageGroups";
import { useMessageAnimationFlags } from "@/features/chat/utils/useMessageAnimationFlags";
import { usePeerChat } from "@/features/chat/contexts/PeerChatContext";
import { LOAD_MORE_SCROLL_THRESHOLD_PX } from "@/features/chat/consts/messages";

type Props = { conversationId: string; hasSingleViewer: boolean };

export const MessageList = ({ conversationId, hasSingleViewer }: Props) => {
    const { user } = useAuth();
    const toggleReaction = ChatMutations.toggleReaction();
    const { broadcastReaction } = usePeerChat();

    const {
        messages,
        users,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = ChatQueries.useMessages(conversationId);

    const groups = useMessageGroups(messages);
    const { newMessageIds, editedMessageIds } =
        useMessageAnimationFlags(messages);

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
                emoji,
                reactedByMe,
            });
            // Fired alongside the API call, same reasoning as
            // broadcastChatMessage: peers already connected see the
            // toggle instantly over the mesh instead of waiting for a
            // manual refresh.
            broadcastReaction(conversationId, messageId, emoji, !reactedByMe);
        },
        [conversationId, toggleReaction, broadcastReaction]
    );

    const handleRequestDelete = useCallback((message: MessageWithDetails) => {
        setDeletingMessage(message);
    }, []);

    return (
        <>
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
        </>
    );
};
