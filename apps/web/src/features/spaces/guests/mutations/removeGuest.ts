import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceGuest } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_GUESTS_QUERY_KEY } from "../consts/queryKeys";

export const useRemoveGuest = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (guestId: string): Promise<SpaceGuest> => {
            const res = await api.delete(
                `/spaces/${spaceId}/guests/${guestId}`
            );
            return res.data.guest;
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
            }),
    });
};
