import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ConversationsListResponse } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { conversationsSearchQueryKey } from "@/features/chat/queries/queryKey";

export const searchConversations = async (
    organizationId: string,
    search: string
): Promise<ConversationsListResponse> => {
    const res = await api.get(`/organizations/${organizationId}/conversations`, {
        params: { search },
    });
    return res.data;
};

// The search runs on the server, which ignores case and accents and reaches
// the conversations beyond the default list. Idle while there is no text.
export const useSearchConversations = (search: string) => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useQuery({
        queryKey: conversationsSearchQueryKey(organizationId, search),
        queryFn: () => searchConversations(organizationId, search),
        enabled: !!organizationId && search !== "",
        placeholderData: keepPreviousData,
    });

    return {
        ...query,
        conversations: query.data?.conversations ?? [],
    };
};
