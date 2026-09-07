import { useConversationMessages } from "./useMessages";
import { useRefreshMessages } from "./useRefreshMessages";
import { useConversationParticipants } from "./useParticipants";
import { useUnreadCounts } from "./useUnreadCounts";
import { useConversations } from "./useConversations";

export const ChatQueries = {
    useMessages: useConversationMessages,
    useRefresh: useRefreshMessages,
    useParticipants: useConversationParticipants,
    useUnreadCounts,
    useConversations,
};

export {
    messagesQueryKey,
    unreadCountsQueryKey,
    conversationsQueryKey,
} from "./queryKey";
export type { MessagesQueryKey } from "./queryKey";
