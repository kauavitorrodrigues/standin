import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceGuestState } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { MY_GUEST_QUERY_KEY } from "../consts/queryKeys";
import { getGuestPollInterval } from "../utils/getGuestPollInterval";

// The state of the signed in person's own request. The socket pushes the
// answer; this is the fallback when it drops, so it polls while waiting.
export const myGuestQueryOptions = (spaceId: string) =>
    queryOptions({
        queryKey: [MY_GUEST_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceGuestState | null> => {
            const res = await api.get(`/spaces/${spaceId}/guests/me`);
            return res.data.guest;
        },
        enabled: !!spaceId,
        refetchInterval: (query) => getGuestPollInterval(query.state.data),
    });

export const useMyGuest = (spaceId: string) => {
    const query = useQuery(myGuestQueryOptions(spaceId));
    return { ...query, guest: query.data };
};
