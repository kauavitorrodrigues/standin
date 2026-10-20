import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarCategory, AvatarSlot } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import {
    AVATAR_CATEGORIES_PATH,
    AVATAR_CATEGORY_SUBPATHS,
} from "../../../consts/paths";
import { buildImageFormData } from "../../../utils/admin/buildImageFormData";
import { invalidateAvatarCategories } from "../../../utils/admin/invalidateAvatarCategories";

type ReplaceCategoryPreviewInput = { slot: AvatarSlot; image: File };

// Adds or swaps the image shown beside the name of the category.
export const useReplaceAvatarCategoryPreview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            slot,
            image,
        }: ReplaceCategoryPreviewInput): Promise<{
            category: AvatarCategory;
        }> => {
            const res = await api.put(
                `${AVATAR_CATEGORIES_PATH}/${slot}/${AVATAR_CATEGORY_SUBPATHS.PREVIEW}`,
                buildImageFormData(image),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarCategories(queryClient),
    });
};
