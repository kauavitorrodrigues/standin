import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_BASE_SUBPATHS, AVATAR_BASES_PATH } from "../../../consts/paths";
import type { AvatarBaseMutationResult } from "../../../types/parts";
import { buildImageFormData } from "../../../utils/admin/buildImageFormData";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

type ReplaceBaseImageInput = { baseId: string; image: File };

// Swaps the sprite sheet of a base. The server rebuilds the avatars that use
// it.
export const useReplaceAvatarBaseImage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            baseId,
            image,
        }: ReplaceBaseImageInput): Promise<AvatarBaseMutationResult> => {
            const res = await api.put(
                `${AVATAR_BASES_PATH}/${baseId}/${AVATAR_BASE_SUBPATHS.IMAGE}`,
                buildImageFormData(image),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
