import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type ReplaceTilesetGridInput = {
    tilesetId: string;
    margin: number;
    spacing: number;
};

export const useReplaceTilesetGrid = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({
            tilesetId,
            margin,
            spacing,
        }: ReplaceTilesetGridInput): Promise<LibraryTilesetDetail> => {
            const res = await api.put(`${apiBase}/tilesets/${tilesetId}/grid`, {
                margin,
                spacing,
            });
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
