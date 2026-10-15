import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    AssetDefinition,
    UpdateLibraryColorSchemaType,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type UpdateColorInput = {
    assetId: string;
    color: UpdateLibraryColorSchemaType["color"];
};

export const useUpdateColor = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        // The answer is every row that had the color, one per rotation.
        mutationFn: async ({
            assetId,
            color,
        }: UpdateColorInput): Promise<AssetDefinition[]> => {
            const res = await api.patch(`${apiBase}/assets/${assetId}/color`, {
                color,
            });
            return res.data.assets;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
