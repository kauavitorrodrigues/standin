import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceFixedLink } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_FIXED_LINK_QUERY_KEY } from "../consts/queryKeys";

// Closes the guest link of the space and makes another.
export const useResetSpaceLink = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<SpaceFixedLink> => {
            const res = await api.post(
                `/spaces/${spaceId}/invite-links/fixed/reset`
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
