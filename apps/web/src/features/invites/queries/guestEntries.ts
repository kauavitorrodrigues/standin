import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { SpaceGuestEntryList } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { SPACE_GUESTS_QUERY_KEY } from "@/features/spaces/guests/consts/queryKeys";
import type { GuestEntriesParams } from "../types/page";
import { ALL_GUESTS_FILTER } from "../consts/guestFilters";

// A page of the guests of the space with their state. The server pages,
// searches and filters them. It sits under the key of the guests of the
// space, so what refreshes that list (a host answered, a socket event)
// refreshes this one too.
export const useGuestEntries = (
    spaceId: string,
    enabled: boolean,
    { filter, ...page }: GuestEntriesParams
) => {
    const query = useQuery({
        queryKey: [SPACE_GUESTS_QUERY_KEY, spaceId, "entries", page, filter],
        queryFn: async (): Promise<SpaceGuestEntryList> => {
            const res = await api.get(`/spaces/${spaceId}/guests/entries`, {
                params: {
                    ...page,
                    state: filter === ALL_GUESTS_FILTER ? undefined : filter,
                },
            });
            return res.data;
        },
        enabled: !!spaceId && enabled,
        // Keeps the rows on screen while the next page loads.
        placeholderData: keepPreviousData,
    });
    return {
        ...query,
        guests: query.data?.guests ?? [],
        total: query.data?.total ?? 0,
    };
};
