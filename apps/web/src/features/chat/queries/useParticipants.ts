import { useQuery } from "@tanstack/react-query";
import type { UserSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const CONVERSATION_PARTICIPANTS_QUERY_KEY = "conversationParticipants";

export const useConversationParticipants = (conversationId: string) => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useQuery({
        queryKey: [CONVERSATION_PARTICIPANTS_QUERY_KEY, conversationId],
        queryFn: async (): Promise<UserSummary[]> => {
            const res = await api.get(
                `/organizations/${organizationId}/conversations/${conversationId}/participants`
            );
            return res.data.participants;
        },
        enabled: !!organizationId && !!conversationId,
    });

    return { ...query, participants: query.data ?? [] };
};
