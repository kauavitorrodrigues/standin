import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_BASES_PATH } from "../../../consts/paths";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

// Deletes a base (soft delete). The default base cannot be deleted, the server
// answers 409 for it.
export const useDeleteAvatarBase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (baseId: string) => {
            await api.delete(`${AVATAR_BASES_PATH}/${baseId}`);
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
