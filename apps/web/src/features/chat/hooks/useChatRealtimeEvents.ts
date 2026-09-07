import { useQueryClient } from "@tanstack/react-query";
import { ChatEvents } from "@standin/contracts";
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

    useSocketEvent(ChatEvents.UNREAD_CHANGED, ({ conversationId }) => {
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
