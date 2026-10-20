import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAvatarPartData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_PARTS_PATH } from "../../consts/paths";
import type { AvatarPartMutationResult } from "../../types/parts";
import { buildPartFormData } from "../../utils/admin/buildPartFormData";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

type CreatePartInput = {
    image: File;
    preview: File;
    data: CreateAvatarPartData;
};

// Creates a base part. The color, when there is one, is the color of the base
// itself, so the first swatch of its family.
export const useCreateAvatarPart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            input: CreatePartInput
        ): Promise<AvatarPartMutationResult> => {
            const res = await api.post(
                AVATAR_PARTS_PATH,
                buildPartFormData(input),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
