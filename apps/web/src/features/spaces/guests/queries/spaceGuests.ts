import { queryOptions, useQuery } from "@tanstack/react-query";
import type { SpaceGuestList } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_GUESTS_QUERY_KEY } from "../consts/queryKeys";

const NO_GUESTS: SpaceGuestList = { pending: [], admitted: [], closed: [] };

// The requests and guests of the space for the hosts, already grouped by what
// a host can do with each one: the server decides the groups and the order.
export const spaceGuestsQueryOptions = (spaceId: string) =>
    queryOptions({
        queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId],
        queryFn: async (): Promise<SpaceGuestList> => {
            const res = await api.get(`/spaces/${spaceId}/guests`);
            return res.data;
        },
        enabled: !!spaceId,
    });

export const useSpaceGuests = (spaceId: string) => {
    const query = useQuery(spaceGuestsQueryOptions(spaceId));
    return { ...query, guests: query.data ?? NO_GUESTS };
};
