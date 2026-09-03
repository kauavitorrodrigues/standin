import { useInfiniteQuery } from "@tanstack/react-query";
import type {
    ConversationMessagesListResponse,
    MessageSender,
    MessageWithDetails,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { messagesQueryKey } from "@/features/chat/queries/queryKey";

const fetchMessages = async (
    organizationId: string,
    conversationId: string,
    cursor: string | undefined
): Promise<ConversationMessagesListResponse> => {
    const res = await api.get(
        `/organizations/${organizationId}/conversations/${conversationId}/messages`,
        { params: cursor ? { cursor } : undefined }
    );
    return res.data;
};

export const useConversationMessages = (conversationId: string) => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useInfiniteQuery({
        queryKey: messagesQueryKey(conversationId),
        queryFn: ({ pageParam }) =>
            fetchMessages(organizationId, conversationId, pageParam),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: !!organizationId && !!conversationId,
    });

    // Each page comes back newest-first (see MessageService.listByConversation).
    // Pages themselves are fetched oldest-last. Reverse both levels so the
    // flattened list reads chronologically, oldest to newest, top to bottom.
    const messages: MessageWithDetails[] =
        query.data?.pages
            .slice()
            .reverse()
            .flatMap((page) => page.messages.slice().reverse()) ?? [];

    const users: Record<string, MessageSender> = {};
    for (const page of query.data?.pages ?? []) {
        Object.assign(users, page.users);
    }

    return { ...query, messages, users };
};
