import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryPalette } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const MAP_PALETTE_QUERY_KEY = "mapPalette";

// What the map owner may place on this map (a template map only sees the
// global library). The server answers 304 while the library has not changed.
export const mapPaletteQueryOptions = (mapId: string) =>
    queryOptions({
        queryKey: [MAP_PALETTE_QUERY_KEY, mapId],
        queryFn: async (): Promise<LibraryPalette> => {
            const res = await api.get(`/maps/${mapId}/library`);
            return res.data.library;
        },
    });

export const useMapPalette = (mapId: string) => {
    const query = useQuery(mapPaletteQueryOptions(mapId));
    return {
        ...query,
        tilesets: query.data?.tilesets ?? [],
        assets: query.data?.assets ?? [],
        categories: query.data?.categories ?? [],
        areas: query.data?.areas ?? [],
    };
};
