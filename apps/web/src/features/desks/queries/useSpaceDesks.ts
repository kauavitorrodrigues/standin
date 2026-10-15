import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useSocketEvent } from "@/features/game/multiplayer/hooks/useSocketEvent";
import type { Desk, DeskEvent } from "../types/desk";
import { applyDeskEvent } from "../utils/applyDeskEvent";

export const SPACE_DESKS_QUERY_KEY = "spaceDesks";

export const spaceDesksQueryKey = (spaceId: string) =>
    [SPACE_DESKS_QUERY_KEY, spaceId] as const;

// Who owns which desk in the space. It starts from the list of the API and
// follows desk_claimed and desk_released of the space room, so a claim of
// someone else shows up with no refetch.
export const useSpaceDesks = (spaceId: string) => {
    const queryClient = useQueryClient();
    const queryKey = spaceDesksQueryKey(spaceId);

    const query = useQuery({
        queryKey,
        queryFn: async (): Promise<Desk[]> => {
            const res = await api.get(`/spaces/${spaceId}/desks`);
            return res.data.desks;
        },
    });

    const handle = (event: DeskEvent) =>
        queryClient.setQueryData<Desk[]>(queryKey, (current) =>
            applyDeskEvent(current ?? [], event)
        );

    useSocketEvent("desk_claimed", (payload) =>
        handle({ type: "claimed", payload })
    );
    useSocketEvent("desk_released", (payload) =>
        handle({ type: "released", payload })
    );

    return { desks: query.data ?? [], isLoading: query.isLoading };
};
