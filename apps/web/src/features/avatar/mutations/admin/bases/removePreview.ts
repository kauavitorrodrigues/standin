import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarBase } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_BASE_SUBPATHS, AVATAR_BASES_PATH } from "../../../consts/paths";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

export const useRemoveAvatarBasePreview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (baseId: string): Promise<{ base: AvatarBase }> => {
            const res = await api.delete(
                `${AVATAR_BASES_PATH}/${baseId}/${AVATAR_BASE_SUBPATHS.PREVIEW}`
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
