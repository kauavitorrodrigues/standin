import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryPalette } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const LIBRARY_PALETTE_QUERY_KEY = "libraryPalette";

// The library of the scope, which is all the composer may use. There is no map, so
// there is no per-map palette. The server answers 304 while it did not change.
export const libraryPaletteQueryOptions = (scope: LibraryScope) =>
    queryOptions({
        queryKey: [LIBRARY_PALETTE_QUERY_KEY, scope.key],
        queryFn: async (): Promise<LibraryPalette> => {
            const res = await api.get(`${scope.apiBase}/palette`);
            return res.data.library;
        },
    });

export const usePalette = () => {
    const scope = useLibraryScope();
    const query = useQuery(libraryPaletteQueryOptions(scope));
    return {
        ...query,
        palette: query.data,
        tilesets: query.data?.tilesets ?? [],
        categories: query.data?.categories ?? [],
    };
};
