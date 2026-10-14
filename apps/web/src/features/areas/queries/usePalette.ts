import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryPalette } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const LIBRARY_PALETTE_QUERY_KEY = "libraryPalette";

// The global library, which is all the composer may use. There is no map, so
// there is no per-map palette. The server answers 304 while it did not change.
export const libraryPaletteQueryOptions = () =>
    queryOptions({
        queryKey: [LIBRARY_PALETTE_QUERY_KEY],
        queryFn: async (): Promise<LibraryPalette> => {
            const res = await api.get("/library/palette");
            return res.data.library;
        },
    });

export const usePalette = () => {
    const query = useQuery(libraryPaletteQueryOptions());
    return {
        ...query,
        palette: query.data,
        tilesets: query.data?.tilesets ?? [],
        categories: query.data?.categories ?? [],
    };
};
