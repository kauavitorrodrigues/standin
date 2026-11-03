import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceFixedLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_FIXED_LINK_QUERY_KEY } from "../consts/queryKeys";

// How long an admitted guest keeps the access. Null: until a host ends it.
export const useSetGuestValidity = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            guestValidityHours: number | null
        ): Promise<SpaceFixedLink> => {
            const res = await api.put(
                `/spaces/${spaceId}/invite-links/fixed/validity`,
                { guestValidityHours }
            );
            return res.data.link;
        },
        onSuccess: (link) =>
            queryClient.setQueryData(
                [SPACE_FIXED_LINK_QUERY_KEY, spaceId],
                link
            ),
    });
};
