import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarBase, UpdateAvatarBaseData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_BASES_PATH } from "../../../consts/paths";
import { invalidateAvatarBases } from "../../../utils/admin/invalidateAvatarBases";

type UpdateBaseInput = { baseId: string; changes: UpdateAvatarBaseData };

// Renames a base or makes it the default, which takes the default from the
// previous one.
export const useUpdateAvatarBase = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            baseId,
            changes,
        }: UpdateBaseInput): Promise<{ base: AvatarBase }> => {
            const res = await api.patch(
                `${AVATAR_BASES_PATH}/${baseId}`,
                changes
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarBases(queryClient),
    });
};
