import { useMemo } from "react";
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

    const pages = query.data?.pages;

    // Each page comes back newest-first, and pages themselves are fetched
    // oldest-last. Walking both levels back to front reads the flattened
    // list chronologically straight into the result array, with no
    // intermediate slice/reverse/flatMap copies of a list that can get long
    // once "load more" has pulled in several pages of history. Memoized on
    // `pages` so consumers keying their own memoization off this array's
    // identity (groupMessagesBySender, useMessageAnimationFlags) only see a
    // new reference when the underlying data actually changed.
    const messages: MessageWithDetails[] = useMemo(() => {
        const result: MessageWithDetails[] = [];
        if (!pages) return result;

        for (let pageIndex = pages.length - 1; pageIndex >= 0; pageIndex--) {
            const pageMessages = pages[pageIndex].messages;
            for (
                let messageIndex = pageMessages.length - 1;
                messageIndex >= 0;
                messageIndex--
            ) {
                result.push(pageMessages[messageIndex]);
            }
        }

        return result;
    }, [pages]);

    const users: Record<string, MessageSender> = useMemo(() => {
        const result: Record<string, MessageSender> = {};
        for (const page of pages ?? []) {
            Object.assign(result, page.users);
        }
        return result;
    }, [pages]);

    return { ...query, messages, users };
};
