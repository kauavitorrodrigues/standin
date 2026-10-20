import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateAvatarPartData } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_PARTS_PATH } from "../../consts/paths";
import type { AvatarPartMutationResult } from "../../types/parts";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

type UpdatePartInput = { partId: string; changes: UpdateAvatarPartData };

// `partId` is the id of a base part or of a variation. The name goes to the
// whole family, the color pair only to the row.
export const useUpdateAvatarPart = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            partId,
            changes,
        }: UpdatePartInput): Promise<
            Pick<AvatarPartMutationResult, "part">
        > => {
            const res = await api.patch(
                `${AVATAR_PARTS_PATH}/${partId}`,
                changes
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
