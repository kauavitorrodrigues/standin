import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { OrganizationMemberEntry } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { MEMBER_ENTRIES_QUERY_KEY } from "../consts/queryKeys";
import type { PageParams } from "../types/page";

// A page of the people of the organization with their e-mail, for the owner.
// The server pages and searches them.
export const useMemberEntries = (
    organizationId: string,
    enabled: boolean,
    params: PageParams
) => {
    const query = useQuery({
        queryKey: [MEMBER_ENTRIES_QUERY_KEY, organizationId, params],
        queryFn: async (): Promise<{
            members: OrganizationMemberEntry[];
            total: number;
        }> => {
            const res = await api.get(
                `/organizations/${organizationId}/member-entries`,
                { params }
            );
            return res.data;
        },
        enabled: !!organizationId && enabled,
        // Keeps the rows on screen while the next page loads.
        placeholderData: keepPreviousData,
    });
    return {
        ...query,
        members: query.data?.members ?? [],
        total: query.data?.total ?? 0,
    };
};
