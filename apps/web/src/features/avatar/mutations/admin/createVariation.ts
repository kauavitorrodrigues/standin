import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAvatarVariationData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_PART_SUBPATHS, AVATAR_PARTS_PATH } from "../../consts/paths";
import type { AvatarPartMutationResult } from "../../types/parts";
import { buildVariationFormData } from "../../utils/admin/buildVariationFormData";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

type CreateVariationInput = {
    // The id of the base part of the family.
    baseId: string;
    image: File;
    preview: File;
    data: CreateAvatarVariationData;
};

// Adds a color to a part. The slot and the name come from the base part.
export const useCreateAvatarVariation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            baseId,
            ...rest
        }: CreateVariationInput): Promise<AvatarPartMutationResult> => {
            const res = await api.post(
                `${AVATAR_PARTS_PATH}/${baseId}/${AVATAR_PART_SUBPATHS.VARIATIONS}`,
                buildVariationFormData(rest),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
