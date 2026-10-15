import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssetDefinition, CreateAssetData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { buildUploadFormData } from "../utils/buildUploadFormData";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type CreateAssetInput = { image: File; data: CreateAssetData };

export const useCreateAsset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            image,
            data,
        }: CreateAssetInput): Promise<AssetDefinition> => {
            const res = await api.post(
                "/library/assets",
                buildUploadFormData(image, data),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.asset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
