import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type DeleteAssetInput = { assetId: string; family: boolean };

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({ assetId, family }: DeleteAssetInput) => {
            const { data } = await api.delete<{ deleted: boolean }>(
                `${apiBase}/assets/${assetId}`,
                { params: { family } }
            );
            return data;
        },
        // Not returned on purpose: returning the promise makes mutateAsync
        // wait for every refetch before the dialog can confirm and close.
        onSuccess: () => {
            invalidateLibrary(queryClient);
        },
    });
};
