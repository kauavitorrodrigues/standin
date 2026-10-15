import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type ReplaceTilesetGridInput = {
    tilesetId: string;
    margin: number;
    spacing: number;
};

export const useReplaceTilesetGrid = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tilesetId,
            margin,
            spacing,
        }: ReplaceTilesetGridInput): Promise<LibraryTilesetDetail> => {
            const res = await api.put(`/library/tilesets/${tilesetId}/grid`, {
                margin,
                spacing,
            });
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
