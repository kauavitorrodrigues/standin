import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetAssetPartsSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type SetAssetPartsInput = SetAssetPartsSchemaType & { assetId: string };

export const useSetAssetParts = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ assetId, parts }: SetAssetPartsInput) => {
            const res = await api.put(`/library/assets/${assetId}/parts`, {
                parts,
            });
            return res.data.parts;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
