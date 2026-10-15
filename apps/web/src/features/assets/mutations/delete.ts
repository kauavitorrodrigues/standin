import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type DeleteAssetInput = { assetId: string; family: boolean };

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ assetId, family }: DeleteAssetInput) => {
            const { data } = await api.delete<{ deleted: boolean }>(
                `/library/assets/${assetId}`,
                { params: { family } }
            );
            return data;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
