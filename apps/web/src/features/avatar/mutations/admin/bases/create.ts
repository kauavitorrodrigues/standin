import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAvatarBaseData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_BASES_PATH } from "../../../consts/paths";
import type { AvatarBaseMutationResult } from "../../../types/parts";
import { buildBaseFormData } from "../../../utils/admin/buildBaseFormData";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

type CreateBaseInput = {
    image: File;
    preview: File | null;
    data: CreateAvatarBaseData;
};

// Registers a blank avatar. The first one becomes the default.
export const useCreateAvatarBase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            input: CreateBaseInput
        ): Promise<AvatarBaseMutationResult> => {
            const res = await api.post(
                AVATAR_BASES_PATH,
                buildBaseFormData(input),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
