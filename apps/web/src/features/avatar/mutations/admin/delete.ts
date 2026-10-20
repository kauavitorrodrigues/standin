import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_PARTS_PATH } from "../../consts/paths";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

// Deletes the part (soft delete). Who already has it keeps it.
export const useDeleteAvatarPart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (partId: string) => {
            await api.delete(`${AVATAR_PARTS_PATH}/${partId}`);
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
