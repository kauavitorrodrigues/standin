import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetAssetPartsSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type SetAssetPartsInput = SetAssetPartsSchemaType & { assetId: string };

export const useSetAssetParts = () => {
    const queryClient = useQueryClient();
    const { apiBase } = useLibraryScope();

    return useMutation({
        mutationFn: async ({ assetId, parts }: SetAssetPartsInput) => {
            const res = await api.put(`${apiBase}/assets/${assetId}/parts`, {
                parts,
            });
            return res.data.parts;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
