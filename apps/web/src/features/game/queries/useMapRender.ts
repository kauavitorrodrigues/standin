import { queryOptions, useQuery } from "@tanstack/react-query";
import type { MapRenderPayload } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const MAP_RENDER_QUERY_KEY = "mapRender";

// Layout, tilesets, asset definitions and placed objects of a map, which the
// game needs to draw it.
export const mapRenderQueryOptions = (mapId: string) =>
    queryOptions({
        queryKey: [MAP_RENDER_QUERY_KEY, mapId],
        queryFn: async (): Promise<MapRenderPayload> => {
            const res = await api.get(`/maps/${mapId}/render`);
            return res.data;
        },
        enabled: !!mapId,
    });

export const useMapRender = (mapId: string) =>
    useQuery(mapRenderQueryOptions(mapId));
