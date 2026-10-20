import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_PART_SUBPATHS, AVATAR_PARTS_PATH } from "../../consts/paths";
import { buildImageFormData } from "../../utils/admin/buildImageFormData";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

// `partId` is the id of a base part or of a variation.
type ReplacePreviewInput = { partId: string; image: File };

// Adds or swaps the thumbnail shown in the part list of the editor. Answers
// the new `previewUrl`.
export const useReplaceAvatarPartPreview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            partId,
            image,
        }: ReplacePreviewInput): Promise<{ previewUrl: string }> => {
            const res = await api.put(
                `${AVATAR_PARTS_PATH}/${partId}/${AVATAR_PART_SUBPATHS.PREVIEW}`,
                buildImageFormData(image),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
