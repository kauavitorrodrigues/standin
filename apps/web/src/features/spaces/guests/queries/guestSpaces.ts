import { queryOptions, useQuery } from "@tanstack/react-query";
import type { GuestSpace } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { GUEST_SPACES_QUERY_KEY } from "../consts/queryKeys";

// The spaces the person entered as a guest and can still enter.
export const guestSpacesQueryOptions = () =>
    queryOptions({
        queryKey: [GUEST_SPACES_QUERY_KEY],
        queryFn: async (): Promise<GuestSpace[]> => {
            const res = await api.get("/users/me/guest-spaces");
            return res.data.spaces;
        },
    });

export const useGuestSpaces = () => {
    const query = useQuery(guestSpacesQueryOptions());
    return { ...query, spaces: query.data ?? [] };
};
