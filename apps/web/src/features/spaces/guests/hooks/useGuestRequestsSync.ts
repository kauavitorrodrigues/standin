import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import { SPACE_GUESTS_QUERY_KEY } from "../consts/queryKeys";

// The hosts read one list the server groups and orders. They hear that it
// changed (a new request, an answer from another host, a request that ran out
// of time) and read it again, so no card is left on screen after it was
// answered elsewhere.
export const useGuestRequestsSync = (spaceId: string) => {
    const queryClient = useQueryClient();

    const refresh = () =>
        queryClient.invalidateQueries({
            queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
        });

    useSocketEvent("space:guest-requested", (requested) => {
        if (requested.guest.spaceId === spaceId) refresh();
    });

    useSocketEvent("space:guest-updated", (updated) => {
        if (updated.spaceId === spaceId) refresh();
    });
};
