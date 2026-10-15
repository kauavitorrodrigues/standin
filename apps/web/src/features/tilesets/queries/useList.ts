import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { LibraryTilesetList } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { TilesetFilters } from "../types/filters";

export const LIBRARY_TILESETS_QUERY_KEY = "libraryTilesets";

// The list comes with the options of every filter, counted over all the
// tilesets, so the sidebar does not change with the filters chosen.
export const useLibraryTilesets = (filters: TilesetFilters) => {
    const { apiBase, key } = useLibraryScope();
    const query = useQuery({
        queryKey: [LIBRARY_TILESETS_QUERY_KEY, key, filters],
        queryFn: async (): Promise<LibraryTilesetList> => {
            const res = await api.get(`${apiBase}/tilesets`, {
                params: filters,
            });
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    return {
        ...query,
        tilesets: query.data?.tilesets ?? [],
        total: query.data?.total ?? 0,
        facets: query.data?.facets,
    };
};
