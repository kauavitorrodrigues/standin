import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { SPACE_GUESTS_QUERY_KEY } from "@/features/spaces/guests/consts/queryKeys";

// Moves a guest who is not inside out of the active lists.
export const useArchiveGuest = (spaceId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (guestId: string): Promise<void> => {
            await api.post(`/spaces/${spaceId}/guests/${guestId}/archive`);
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
            }),
    });
};
