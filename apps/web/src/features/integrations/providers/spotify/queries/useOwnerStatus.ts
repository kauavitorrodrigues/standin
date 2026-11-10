import { useQuery } from "@tanstack/react-query";
import { SPOTIFY_OWNER_QUERY_KEY } from "../consts/queryKeys";
import { fetchOwnerStatus } from "../lib/spotifyApi";

export const useOwnerStatus = (organizationId: string, enabled: boolean) =>
    useQuery({
        queryKey: [SPOTIFY_OWNER_QUERY_KEY, organizationId],
        queryFn: () => fetchOwnerStatus(organizationId),
        enabled: enabled && organizationId !== "",
    });
