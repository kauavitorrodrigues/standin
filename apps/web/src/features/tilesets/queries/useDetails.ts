import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import type { LibraryScope } from "@/features/library/types/LibraryScope";

export const LIBRARY_TILESET_QUERY_KEY = "libraryTileset";

// One tileset with its grid and its `tileMeta`.
export const libraryTilesetQueryOptions = (
    scope: LibraryScope,
    tilesetId: string
) =>
    queryOptions({
        queryKey: [LIBRARY_TILESET_QUERY_KEY, scope.key, tilesetId],
        queryFn: async (): Promise<LibraryTilesetDetail> => {
            const res = await api.get(`${scope.apiBase}/tilesets/${tilesetId}`);
            return res.data.tileset;
        },
        enabled: !!tilesetId,
    });

export const useLibraryTileset = (tilesetId: string) => {
    const scope = useLibraryScope();
    return useQuery(libraryTilesetQueryOptions(scope, tilesetId));
};
