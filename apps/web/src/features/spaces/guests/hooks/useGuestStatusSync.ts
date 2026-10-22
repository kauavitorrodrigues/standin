import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { SPACE_GUEST_STATUSES, type SpaceGuestState } from "@standin/contracts";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import {
    GUEST_SPACES_QUERY_KEY,
    MY_GUEST_QUERY_KEY,
    SPACE_VIEW_QUERY_KEY,
} from "../consts/queryKeys";

// Admitted, the space can be opened now, so a page waiting on it reads it
// again. Anything else only marks what is known of the space as old.
const refreshSpaceView = (queryClient: QueryClient, state: SpaceGuestState) => {
    const queryKey = [SPACE_VIEW_QUERY_KEY, state.spaceId];

    if (state.status === SPACE_GUEST_STATUSES.ADMITTED) {
        queryClient.invalidateQueries({ queryKey });
        return;
    }
    queryClient.invalidateQueries({ queryKey, refetchType: "none" });
};

// The answer to the request of the signed in person arrives over the realtime
// socket of the user room, so it reaches them on the waiting room, the home
// or anywhere else in the app. It writes the state where the pages read it.
export const useGuestStatusSync = () => {
    const queryClient = useQueryClient();

    useSocketEvent("space:guest-status", (state) => {
        queryClient.setQueryData([MY_GUEST_QUERY_KEY, state.spaceId], state);
        queryClient.invalidateQueries({ queryKey: [GUEST_SPACES_QUERY_KEY] });
        refreshSpaceView(queryClient, state);
    });
};
