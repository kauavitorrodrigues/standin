import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssetDefinition } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { buildUploadFormData } from "../utils/buildUploadFormData";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type ReplaceAssetImageInput = { assetId: string; image: File };

export const useReplaceAssetImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            assetId,
            image,
        }: ReplaceAssetImageInput): Promise<AssetDefinition> => {
            const res = await api.put(
                `/library/assets/${assetId}/image`,
                buildUploadFormData(image, null),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.asset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
