import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceInviteLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { INVITE_LINKS_QUERY_KEY } from "../consts/queryKeys";

// The links of the space that can still be used. Only the owner reads them.
export const inviteLinksQueryOptions = (spaceId: string, enabled: boolean) =>
    queryOptions({
        queryKey: [INVITE_LINKS_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceInviteLink[]> => {
            const res = await api.get(`/spaces/${spaceId}/invite-links`);
            return res.data.links;
        },
        enabled: !!spaceId && enabled,
    });

export const useInviteLinks = (spaceId: string, enabled: boolean) => {
    const query = useQuery(inviteLinksQueryOptions(spaceId, enabled));
    return { ...query, links: query.data ?? [] };
};
