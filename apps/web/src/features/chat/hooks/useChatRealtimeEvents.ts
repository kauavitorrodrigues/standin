import { useQueryClient } from "@tanstack/react-query";
import { ChatEvents } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { fetchConversations } from "@/features/chat/queries/useConversations";
import { getConversationNotificationTitle } from "@/features/chat/utils/getConversationNotificationTitle";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import { notifyWhenAway } from "@/features/notifications/lib/notifyWhenAway";
import {
    shouldNotifyChat,
    shouldPlayChatSound,
} from "@/features/notifications/utils/shouldNotifyChat";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import {
    conversationsQueryKey,
    messagesQueryKey,
    unreadCountsQueryKey,
} from "@/features/chat/queries/queryKey";

// Fires whenever someone else sends a message in a conversation this user
// can see, including while this client isn't on the space page for it.
// Only ever triggers a refetch, never applies the payload directly to the
// cache: the socket event just says "something changed", the REST fetch
// remains the source of truth for content.
export const useChatRealtimeEvents = () => {
    const queryClient = useQueryClient();
    const organizationId = useOrganization().organization?.id ?? "";
    const { user } = useAuth();

    // The event carries no message, so the conversation list is fetched
    // fresh to know what arrived, who sent it and what kind of conversation
    // it is. Only matters to someone tabbed away (see notifyWhenAway).
    const notifyIncomingMessage = async (conversationId: string) => {
        if (!document.hidden) return;

        const { conversations } = await queryClient.fetchQuery({
            queryKey: conversationsQueryKey(organizationId),
            queryFn: () => fetchConversations(organizationId),
            staleTime: 0,
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

    useSocketEvent(ChatEvents.UNREAD_CHANGED, ({ conversationId }) => {
        void notifyIncomingMessage(conversationId);
        queryClient.invalidateQueries({
            queryKey: unreadCountsQueryKey(organizationId),
        });
        // Per-conversation badges (space row, DM list items) read
        // unreadCount off this query, not off unreadCountsQueryKey, so it
        // needs its own invalidation too.
        queryClient.invalidateQueries({
            queryKey: conversationsQueryKey(organizationId),
        });
        queryClient.invalidateQueries({
            queryKey: messagesQueryKey(conversationId),
        });
    });

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
