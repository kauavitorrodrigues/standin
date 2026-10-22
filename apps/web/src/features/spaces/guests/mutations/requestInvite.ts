import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InviteRequestResult } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { MY_GUEST_QUERY_KEY } from "../consts/queryKeys";

export const useRequestInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (token: string): Promise<InviteRequestResult> => {
            const res = await api.post(
                `/invites/${encodeURIComponent(token)}/request`
            );
            return res.data;
        },
        onSuccess: (result) => {
            queryClient.setQueryData(
                [MY_GUEST_QUERY_KEY, result.spaceId],
                result.guest
            );
        },
    });
};
