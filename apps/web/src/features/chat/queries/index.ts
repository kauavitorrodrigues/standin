import { useConversationMessages } from "./useMessages";
import { useRefreshMessages } from "./useRefreshMessages";
import { useConversationParticipants } from "./useParticipants";

export const ChatQueries = {
    useMessages: useConversationMessages,
    useRefresh: useRefreshMessages,
    useParticipants: useConversationParticipants,
};

export { messagesQueryKey } from "./queryKey";
export type { MessagesQueryKey } from "./queryKey";
