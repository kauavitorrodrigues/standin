import { useQuery } from "@tanstack/react-query";
import type { ConversationsListResponse } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { conversationsQueryKey } from "@/features/chat/queries/queryKey";

const fetchConversations = async (
    organizationId: string
): Promise<ConversationsListResponse> => {
    const res = await api.get(`/organizations/${organizationId}/conversations`);
    return res.data;
};

export const useConversations = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useQuery({
        queryKey: conversationsQueryKey(organizationId),
        queryFn: () => fetchConversations(organizationId),
        enabled: !!organizationId,
    });

    return { ...query, conversations: query.data?.conversations ?? [] };
};
