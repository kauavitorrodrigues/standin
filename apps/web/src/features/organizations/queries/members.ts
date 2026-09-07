import { useQuery } from "@tanstack/react-query";
import type { UserSummary } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useOrganization } from "@/features/organizations/hooks/useOrganization";

export const ORGANIZATION_MEMBERS_QUERY_KEY = "organizationMembers";

export const useOrganizationMembers = () => {
    const organizationId = useOrganization().organization?.id ?? "";

    const query = useQuery({
        queryKey: [ORGANIZATION_MEMBERS_QUERY_KEY, organizationId],
        queryFn: async (): Promise<UserSummary[]> => {
            const res = await api.get(
                `/organizations/${organizationId}/members`
            );
            return res.data.members;
        },
        enabled: !!organizationId,
    });

    return { ...query, members: query.data ?? [] };
};
