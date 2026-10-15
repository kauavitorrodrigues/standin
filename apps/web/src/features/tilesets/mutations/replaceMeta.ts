import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TileMeta } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type ReplaceTileMetaInput = { tilesetId: string; tileMeta: TileMeta };

export const useReplaceTileMeta = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({ tilesetId, tileMeta }: ReplaceTileMetaInput) => {
            const res = await api.put(
                `${apiBase}/tilesets/${tilesetId}/tile-meta`,
                { tileMeta }
            );
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
