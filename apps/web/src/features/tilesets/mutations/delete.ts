import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "@/features/assets/utils/invalidateLibrary";

export const useDeleteTileset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Deletes the tileset. The maps that paint with it keep rendering it.
        mutationFn: async (tilesetId: string) => {
            const { data } = await api.delete<{ deleted: boolean }>(
                `/library/tilesets/${tilesetId}`
            );
            return data;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
