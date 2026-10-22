import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Space, SpaceGuestAccess } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import {
    SPACE_GUESTS_QUERY_KEY,
    SPACE_VIEW_QUERY_KEY,
} from "../consts/queryKeys";

export const useSetGuestAccess = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (guestAccess: SpaceGuestAccess): Promise<Space> => {
            const res = await api.put(`/spaces/${spaceId}/guest-access`, {
                guestAccess,
            });
            return res.data.space;
        },
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey: [SPACE_VIEW_QUERY_KEY, spaceId],
                }),
                queryClient.invalidateQueries({
                    queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
                }),
            ]),
    });
};
