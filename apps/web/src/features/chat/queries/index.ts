import { useConversationMessages } from "./useMessages";
import { useRefreshMessages } from "./useRefreshMessages";
import { useConversationParticipants } from "./useParticipants";
import { useUnreadCounts } from "./useUnreadCounts";
import { useConversations } from "./useConversations";
import { useSearchConversations } from "./useSearchConversations";

export const ChatQueries = {
    useMessages: useConversationMessages,
    useRefresh: useRefreshMessages,
    useParticipants: useConversationParticipants,
    useUnreadCounts,
    useConversations,
    useSearchConversations,
};

export {
    messagesQueryKey,
    messagesListQueryKey,
    threadMessagesQueryKey,
    unreadCountsQueryKey,
    conversationsQueryKey,
} from "./queryKey";
export type { MessagesQueryKey } from "./queryKey";
