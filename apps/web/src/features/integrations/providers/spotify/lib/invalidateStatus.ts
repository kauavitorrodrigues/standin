import type { QueryClient } from "@tanstack/react-query";
import {
    SPOTIFY_MEMBER_QUERY_KEY,
    SPOTIFY_OWNER_QUERY_KEY,
} from "../consts/queryKeys";

/** Both views read the same connections, so a change refreshes both. */
export const invalidateSpotifyStatus = (
    queryClient: QueryClient,
    organizationId: string
): Promise<unknown> =>
    Promise.all([
        queryClient.invalidateQueries({
            queryKey: [SPOTIFY_OWNER_QUERY_KEY, organizationId],
        }),
        queryClient.invalidateQueries({
            queryKey: [SPOTIFY_MEMBER_QUERY_KEY, organizationId],
        }),
    ]);
