import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@standin/contracts";
import type { UseSpaceConnectionOptions } from "@/features/game/multiplayer/hooks/useSpaceConnection";
import {
    messagesQueryKey,
    unreadCountsQueryKey,
    conversationsQueryKey,
} from "@/features/chat/queries";
import {
    prependMessage,
    removeMessage,
    updateMessage,
    type MessagesData,
} from "@/features/chat/utils/messagesCache";
import { applyRemoteReactionToggle } from "@/features/chat/utils/toggleReactionSummary";
import { useTypingByConversation } from "@/features/chat/hooks/useTypingByConversation";

type PeerChatSyncOptions = {
    organizationId: string;
    userId: User["id"];
};

type PeerChatHandlers = Pick<
    UseSpaceConnectionOptions,
    | "onChatMessage"
    | "onTyping"
    | "onReaction"
    | "onEdit"
    | "onDelete"
    | "onConfirm"
>;

// Applies what peers send over the mesh (messages, typing, reactions, edits,
// deletions) to the chat cache. The handlers go straight into
// useSpaceConnection.
export const usePeerChatSync = ({
    organizationId,
    userId,
}: PeerChatSyncOptions) => {
    const queryClient = useQueryClient();
    const { typingByConversation, setUserTyping } = useTypingByConversation();

    const handlers: PeerChatHandlers = {
        onChatMessage: (_socketId, { conversationId, message, senderName }) => {
            // Our own message is already applied optimistically by the
            // send mutation, so only other peers' messages need to be
            // merged here.
            if (message.senderId === userId) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    // seenBy never travels over the peer mesh (see
                    // broadcastChatMessage). A message arriving this way
                    // hasn't been seen by anyone in this client's cache yet.
                    prependMessage(
                        data,
                        { ...message, seenBy: [] },
                        {
                            id: message.senderId,
                            name: senderName,
                            avatarUrl: null,
                        }
                    )
            );
            queryClient.invalidateQueries({
                queryKey: unreadCountsQueryKey(organizationId),
            });
            // Keeps the per-conversation badge in the DM list current too:
            // it reads unreadCount off this query, not off
            // unreadCountsQueryKey.
            queryClient.invalidateQueries({
                queryKey: conversationsQueryKey(organizationId),
            });
        },
        onTyping: (
            _socketId,
            { conversationId, userId: typingUserId, userName, isTyping }
        ) => {
            if (typingUserId === userId) return;
            setUserTyping(conversationId, typingUserId, userName, isTyping);
        },
        onReaction: (
            _socketId,
            {
                conversationId,
                messageId,
                emoji,
                userId: reactingUserId,
                added,
            }
        ) => {
            // Our own toggle is already applied optimistically by the
            // reaction mutation, so only other peers' toggles need to be
            // merged here.
            if (reactingUserId === userId) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, messageId, (message) => ({
                            ...message,
                            reactions: applyRemoteReactionToggle(
                                message.reactions,
                                emoji,
                                added
                            ),
                        }))
                        : data
            );
        },
        onEdit: (
            _socketId,
            {
                conversationId,
                messageId,
                userId: editingUserId,
                content,
                editedAt,
            }
        ) => {
            // Our own edit is already applied optimistically by the
            // update mutation, so only other peers' edits need to be
            // merged here.
            if (editingUserId === userId) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, messageId, (message) =>
                        // Only the message's own sender may edit it,
                        // same rule the API enforces. A peer claiming
                        // someone else's userId already got filtered
                        // out earlier, but this also stops a peer
                        // editing a message that isn't theirs.
                            message.senderId === editingUserId
                                ? { ...message, content, editedAt }
                                : message
                        )
                        : data
            );
        },
        onDelete: (
            _socketId,
            { conversationId, messageId, userId: deletingUserId }
        ) => {
            // Our own deletion is already applied optimistically by the
            // delete mutation, so only other peers' deletions need to be
            // merged here.
            if (deletingUserId === userId) return;

            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? removeMessage(
                            data,
                            messageId,
                            (message) => message.senderId === deletingUserId
                        )
                        : data
            );
        },
        onConfirm: (_socketId, { conversationId, tempId, message }) => {
            // Swaps the temporary peer-*-id entry (see broadcastChatMessage)
            // for the real persisted row, so reacting/editing/deleting a
            // message received over the mesh targets an id the backend
            // actually knows about. The temp id is kept on the merged row
            // (see messageRenderKey) purely so the row's React key stays
            // stable across the swap. Without it, this id change reads to
            // React as the temp row being removed and the real one being
            // added, which replays the entrance animation a second time.
            queryClient.setQueryData<MessagesData>(
                messagesQueryKey(conversationId),
                (data) =>
                    data
                        ? updateMessage(data, tempId, () => ({
                            // seenBy never travels over the peer mesh (see
                            // broadcastConfirm). This is always our own
                            // just-sent message, so nobody else has seen it
                            // yet either way.
                            ...message,
                            seenBy: [],
                            tempId,
                        }))
                        : data
            );
        },
    };

    return { handlers, typingByConversation };
};
