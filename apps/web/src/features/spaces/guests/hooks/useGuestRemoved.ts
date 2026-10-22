import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import {
    GUEST_SPACES_QUERY_KEY,
    MY_GUEST_QUERY_KEY,
    SPACE_VIEW_QUERY_KEY,
} from "../consts/queryKeys";

// The server cut the access of the guest (kicked, expired, guest access turned
// off). The space is no longer theirs, so what the pages know of it goes and
// the person goes home.
export const useGuestRemoved = (spaceId: string) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useSocketEvent("space:guest-removed", (removed) => {
        if (removed.spaceId !== spaceId) return;

        queryClient.removeQueries({
            queryKey: [SPACE_VIEW_QUERY_KEY, spaceId],
        });
        queryClient.invalidateQueries({
            queryKey: [MY_GUEST_QUERY_KEY, spaceId],
        });
        queryClient.invalidateQueries({ queryKey: [GUEST_SPACES_QUERY_KEY] });
        navigate({ to: "/home" });
    });
};
