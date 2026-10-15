import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    AssetDefinition,
    UpdateLibraryAssetSchemaType,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type UpdateAssetInput = {
    assetId: string;
    changes: UpdateLibraryAssetSchemaType;
};

export const useUpdateAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // The answer is every row the edit reached, a whole family or the
        // colors of one rotation.
        mutationFn: async ({
            assetId,
            changes,
        }: UpdateAssetInput): Promise<AssetDefinition[]> => {
            const res = await api.patch(`/library/assets/${assetId}`, changes);
            return res.data.assets;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
