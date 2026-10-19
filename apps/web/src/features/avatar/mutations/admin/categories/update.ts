import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
    AvatarCategory,
    AvatarSlot,
    UpdateAvatarCategoryData,
} from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_CATEGORIES_PATH } from "../../../consts/paths";
import { invalidateAvatarCategories } from "../../../utils/admin/invalidateAvatarCategories";

type UpdateCategoryInput = {
    slot: AvatarSlot;
    changes: UpdateAvatarCategoryData;
};

export const useUpdateAvatarCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            slot,
            changes,
        }: UpdateCategoryInput): Promise<{ category: AvatarCategory }> => {
            const res = await api.patch(
                `${AVATAR_CATEGORIES_PATH}/${slot}`,
                changes
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarCategories(queryClient),
    });
};
