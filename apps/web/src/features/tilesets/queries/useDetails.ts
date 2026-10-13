import { queryOptions, useQuery } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";

export const LIBRARY_TILESET_QUERY_KEY = "libraryTileset";

// One tileset with its grid and its `tileMeta`.
export const libraryTilesetQueryOptions = (tilesetId: string) =>
    queryOptions({
        queryKey: [LIBRARY_TILESET_QUERY_KEY, tilesetId],
        queryFn: async (): Promise<LibraryTilesetDetail> => {
            const res = await api.get(`/library/tilesets/${tilesetId}`);
            return res.data.tileset;
        },
        enabled: !!tilesetId,
    });

export const useLibraryTileset = (tilesetId: string) =>
    useQuery(libraryTilesetQueryOptions(tilesetId));
