import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarBase } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_BASE_SUBPATHS, AVATAR_BASES_PATH } from "../../../consts/paths";
import { buildImageFormData } from "../../../utils/admin/buildImageFormData";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

type ReplaceBasePreviewInput = { baseId: string; image: File };

// Adds or swaps the image shown in the list of bases.
export const useReplaceAvatarBasePreview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            baseId,
            image,
        }: ReplaceBasePreviewInput): Promise<{ base: AvatarBase }> => {
            const res = await api.put(
                `${AVATAR_BASES_PATH}/${baseId}/${AVATAR_BASE_SUBPATHS.PREVIEW}`,
                buildImageFormData(image),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
