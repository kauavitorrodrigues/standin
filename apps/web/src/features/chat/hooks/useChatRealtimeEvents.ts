import { useEffect } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
    ChatEvents,
    type ConversationsListResponse,
    type UnreadCounts,
} from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchConversations } from "@/features/chat/queries/useConversations";
import { getConversationNotificationTitle } from "@/features/chat/utils/getConversationNotificationTitle";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { notifyWhenAway } from "@/features/notifications/lib/notifyWhenAway";
import {
    shouldNotifyChat,
    shouldPlayChatSound,
} from "@/features/notifications/utils/shouldNotifyChat";
import { realtimeSocket } from "@/features/realtime/socket";
import { applyUnreadCount } from "@/features/chat/utils/applyUnreadCount";
import { applyMessageToConversations } from "@/features/chat/utils/applyMessageToConversations";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import { applyCreatedMessageToMessages } from "@/features/chat/utils/applyCreatedMessageToMessages";
import {
    removeMessage,
    updateMessage,
    type MessagesData,
} from "@/features/chat/utils/messagesCache";
import { applyRemoteReactionToggle } from "@/features/chat/utils/toggleReactionSummary";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import {
    conversationsQueryKey,
    messagesQueryKey,
    unreadCountsQueryKey,
} from "@/features/chat/queries/queryKey";

const isCachedReply = (
    queryClient: QueryClient,
    conversationId: string,
    messageId: string
): boolean =>
    queryClient
        .getQueriesData<MessagesData>({
            queryKey: messagesQueryKey(conversationId),
        })
        .some(([, data]) =>
            data?.pages.some((page) =>
                page.messages.some(
                    (message) =>
                        message.id === messageId && message.threadParentId !== null
                )
            )
        );

// Listens to what other people do in the conversations this user can see,
// including while this client isn't on the space page for them. A new message
// is applied straight to the caches, with the unread count the server worked
// out for this user. The REST fetch stays the source of truth after a
// reconnect.
export const useChatRealtimeEvents = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganization().organization?.id ?? "";
    const { user } = useAuth();

    // The cached conversation list, already patched with the new message,
    // gives the kind of conversation and how to title it. Only matters to
    // someone tabbed away (see notifyWhenAway).
    const notifyIncomingMessage = async (conversationId: string) => {
        if (!document.hidden) return;

        const { conversations } = await queryClient.fetchQuery({
            queryKey: conversationsQueryKey(organizationId),
            queryFn: () => fetchConversations(organizationId),
            staleTime: Infinity,
        });
        const conversation = conversations.find(
            ({ id }) => id === conversationId
        );
        const lastMessage = conversation?.lastMessage;
        if (!conversation || !lastMessage) return;
        if (lastMessage.senderId === user.id) return;

        const settings = notificationSettingsPreference.get();
        notifyWhenAway({
            title: getConversationNotificationTitle(conversation),
            body: lastMessage.content ?? "Enviou um arquivo",
            tag: conversationId,
            showNotification: shouldNotifyChat(
                settings.chatNotify,
                conversation.type
            ),
            playSound: shouldPlayChatSound(
                settings.chatSound,
                conversation.type
            ),
        });
    };

    // Events missed while the socket was down are not replayed, so the counts
    // and the list are fetched again once it is back.
    useEffect(() => {
        const refetchAfterReconnect = () => {
            queryClient.invalidateQueries({
                queryKey: unreadCountsQueryKey(organizationId),
            });
            queryClient.invalidateQueries({
                queryKey: conversationsQueryKey(organizationId),
            });
        };

        realtimeSocket.io.on("reconnect", refetchAfterReconnect);
        return () => {
            realtimeSocket.io.off("reconnect", refetchAfterReconnect);
        };
    }, [queryClient, organizationId]);

    // The server sends what happened after it saved it. A conversation that was
    // never opened has no cache to update: it is fetched when it is.
    useSocketEvent(
        ChatEvents.MESSAGE_CREATED,
        (payload) => {
            const { conversationId, unreadCount } = payload;
            // The badge and the last message come in the event, so neither the
            // counts nor the list are refetched for a new message.
            queryClient.setQueryData<UnreadCounts>(
                unreadCountsQueryKey(organizationId),
                (data) => applyUnreadCount(data, conversationId, unreadCount)
            );
            // The key prefix also reaches the cached searches, so a visible
            // search result keeps its badge and last message current.
            queryClient.setQueriesData<ConversationsListResponse>(
                { queryKey: conversationsQueryKey(organizationId) },
                (data) => applyMessageToConversations(data, payload)
            );
            // Only a conversation the list does not have yet is fetched.
            const listed = queryClient
                .getQueryData<ConversationsListResponse>(
                    conversationsQueryKey(organizationId)
                )
                ?.conversations.some(({ id }) => id === conversationId);
            if (listed === false) {
                queryClient.invalidateQueries({
                    queryKey: conversationsQueryKey(organizationId),
                });
            }
            void notifyIncomingMessage(conversationId);

            applyCreatedMessageToMessages(queryClient, payload);
        }
    );

    // The key prefix reaches the main list and every open thread of the
    // conversation, since a reply can sit in both.
    useSocketEvent(
        ChatEvents.MESSAGE_UPDATED,
        ({ conversationId, messageId, userId: editingUserId, content, editedAt }) => {
            queryClient.setQueriesData<MessagesData>(
                { queryKey: messagesQueryKey(conversationId) },
                (data) =>
                    data &&
                    updateMessage(data, messageId, (message) =>
                        // Only the sender may edit, the same rule the API holds.
                        message.senderId === editingUserId
                            ? { ...message, content, editedAt }
                            : message
                    )
            );
        }
    );

    useSocketEvent(
        ChatEvents.MESSAGE_DELETED,
        ({ conversationId, messageId, userId: deletingUserId }) => {
            const wasReply = isCachedReply(
                queryClient,
                conversationId,
                messageId
            );
            queryClient.setQueriesData<MessagesData>(
                { queryKey: messagesQueryKey(conversationId) },
                (data) =>
                    data &&
                    removeMessage(
                        data,
                        messageId,
                        (message) => message.senderId === deletingUserId
                    )
            );
            // The parent's count is worked out by the server, so the main
            // list is fetched again when a reply went away.
            if (!wasReply) return;
            queryClient.invalidateQueries({
                queryKey: messagesQueryKey(conversationId),
                exact: true,
            });
        }
    );

    useSocketEvent(
        ChatEvents.REACTION_TOGGLED,
        ({ conversationId, messageId, emoji, added }) => {
            queryClient.setQueriesData<MessagesData>(
                { queryKey: messagesQueryKey(conversationId) },
                (data) =>
                    data &&
                    updateMessage(data, messageId, (message) => ({
                        ...message,
                        reactions: applyRemoteReactionToggle(
                            message.reactions,
                            emoji,
                            added
                        ),
                    }))
            );
        }
    );

    // Fires whenever someone else marks this conversation as read, so the
    // sender sees an instant "seen at"/"seen by" update instead of waiting
    // for a reopen. Only the message list needs refetching: reads never
    // change unread counts for anyone but the reader themselves.
    useSocketEvent(ChatEvents.MESSAGE_SEEN, ({ conversationId }) => {
        queryClient.invalidateQueries({
            queryKey: messagesQueryKey(conversationId),
        });
    });
};
