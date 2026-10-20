import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarCategory, AvatarSlot } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import {
    AVATAR_CATEGORIES_PATH,
    AVATAR_CATEGORY_SUBPATHS,
} from "../../../consts/paths";
import { invalidateAvatarCategories } from "../../../utils/admin/invalidateAvatarCategories";

export const useRemoveAvatarCategoryPreview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            slot: AvatarSlot
        ): Promise<{ category: AvatarCategory }> => {
            const res = await api.delete(
                `${AVATAR_CATEGORIES_PATH}/${slot}/${AVATAR_CATEGORY_SUBPATHS.PREVIEW}`
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarCategories(queryClient),
    });
};
