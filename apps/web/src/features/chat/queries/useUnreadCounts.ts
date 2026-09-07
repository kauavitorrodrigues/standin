import { useQuery } from "@tanstack/react-query";
import type { UnreadCounts } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";
import { unreadCountsQueryKey } from "@/features/chat/queries/queryKey";

const fetchUnreadCounts = async (
    organizationId: string
): Promise<UnreadCounts> => {
    const res = await api.get(
        `/organizations/${organizationId}/conversations/unread-counts`
    );
    return res.data;
};

export const useUnreadCounts = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useQuery({
        queryKey: unreadCountsQueryKey(organizationId),
        queryFn: () => fetchUnreadCounts(organizationId),
        enabled: !!organizationId,
    });

    return {
        ...query,
        counts: query.data?.counts ?? {},
        total: query.data?.total ?? 0,
    };
};
