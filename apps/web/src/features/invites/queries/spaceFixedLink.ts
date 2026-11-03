import { useQuery } from "@tanstack/react-query";
import type { SpaceFixedLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_FIXED_LINK_QUERY_KEY } from "../consts/queryKeys";

// The link holds a secret: it is read when the dialog opens and not kept
// around after.
export const useSpaceFixedLink = (spaceId: string, enabled: boolean) =>
    useQuery({
        queryKey: [SPACE_FIXED_LINK_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceFixedLink> => {
            const res = await api.get(`/spaces/${spaceId}/invite-links/fixed`);
            return res.data.link;
        },
        enabled: !!spaceId && enabled,
        staleTime: 0,
        gcTime: 0,
    });
