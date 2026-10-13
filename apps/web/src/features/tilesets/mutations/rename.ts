import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LibraryTilesetDetail } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

type RenameTilesetInput = { tilesetId: string; name: string };

export const useRenameTileset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tilesetId,
            name,
        }: RenameTilesetInput): Promise<LibraryTilesetDetail> => {
            const res = await api.patch(`/library/tilesets/${tilesetId}`, {
                name,
            });
            return res.data.tileset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
