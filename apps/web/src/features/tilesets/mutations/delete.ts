import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

export const useDeleteTileset = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        // Deletes the tileset. The maps that paint with it keep rendering it.
        mutationFn: async (tilesetId: string) => {
            const { data } = await api.delete<{ deleted: boolean }>(
                `${apiBase}/tilesets/${tilesetId}`
            );
            return data;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
