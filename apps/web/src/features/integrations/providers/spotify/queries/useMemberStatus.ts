import { useQuery } from "@tanstack/react-query";
import { SPOTIFY_MEMBER_QUERY_KEY } from "../consts/queryKeys";
import { fetchMemberStatus } from "../lib/spotifyApi";

export const useMemberStatus = (organizationId: string) =>
    useQuery({
        queryKey: [SPOTIFY_MEMBER_QUERY_KEY, organizationId],
        queryFn: () => fetchMemberStatus(organizationId),
        enabled: organizationId !== "",
    });
