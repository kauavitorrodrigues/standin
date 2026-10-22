import { queryOptions, useQuery } from "@tanstack/react-query";
import type { IceServersResponse } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ICE_SERVERS_REFETCH_INTERVAL_MS } from "../consts/ice";

export const ICE_SERVERS_QUERY_KEY = "iceServers";

// The credentials go only to who may be in the space, so the space is part of
// the request and of the key.
export const iceServersQueryOptions = (spaceId: string) =>
    queryOptions({
        queryKey: [ICE_SERVERS_QUERY_KEY, spaceId],
        queryFn: async (): Promise<RTCIceServer[]> => {
            const res = await api.get<IceServersResponse>("/ice-servers", {
                params: { spaceId },
            });
            return res.data.iceServers;
        },
        staleTime: ICE_SERVERS_REFETCH_INTERVAL_MS,
        // Without this the list would only ever be fetched once per page
        // (the app disables refetching on window focus), and a long session
        // would end up holding expired credentials.
        refetchInterval: ICE_SERVERS_REFETCH_INTERVAL_MS,
    });

export const useIceServers = (spaceId: string) =>
    useQuery(iceServersQueryOptions(spaceId));
