import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type RenameTilesetInput = { tilesetId: string; name: string };

export const useRenameTileset = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({
            tilesetId,
            name,
        }: RenameTilesetInput): Promise<LibraryTilesetDetail> => {
            const res = await api.patch(`${apiBase}/tilesets/${tilesetId}`, {
                name,
            });
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
