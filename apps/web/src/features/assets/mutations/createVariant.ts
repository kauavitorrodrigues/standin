import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AssetDefinition, CreateVariantData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { buildUploadFormData } from "../utils/buildUploadFormData";
import { invalidateLibrary } from "../utils/invalidateLibrary";

type CreateVariantInput = {
    baseId: string;
    image: File;
    data: CreateVariantData;
};

export const useCreateVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            baseId,
            image,
            data,
        }: CreateVariantInput): Promise<AssetDefinition> => {
            const res = await api.post(
                `/library/assets/${baseId}/variants`,
                buildUploadFormData(image, data),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.asset;
        },
        onSuccess: () => invalidateLibrary(queryClient),
    });
};
