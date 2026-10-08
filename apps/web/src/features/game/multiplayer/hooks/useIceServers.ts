import { queryOptions, useQuery } from "@tanstack/react-query";
import type { IceServersResponse } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { ICE_SERVERS_REFETCH_INTERVAL_MS } from "../consts/ice";

export const ICE_SERVERS_QUERY_KEY = "iceServers";

export const iceServersQueryOptions = () =>
    queryOptions({
        queryKey: [ICE_SERVERS_QUERY_KEY],
        queryFn: async (): Promise<RTCIceServer[]> => {
            const res = await api.get<IceServersResponse>("/ice-servers");
            return res.data.iceServers;
        },
        staleTime: ICE_SERVERS_REFETCH_INTERVAL_MS,
        // Without this the list would only ever be fetched once per page
        // (the app disables refetching on window focus), and a long session
        // would end up holding expired credentials.
        refetchInterval: ICE_SERVERS_REFETCH_INTERVAL_MS,
    });

export const useIceServers = () => useQuery(iceServersQueryOptions());
