import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_PART_SUBPATHS, AVATAR_PARTS_PATH } from "../../consts/paths";
import type { AvatarPartMutationResult } from "../../types/parts";
import { buildSheetFormData } from "../../utils/admin/buildSheetFormData";
import { invalidateAvatarParts } from "../../utils/admin/invalidateAvatarParts";

// `partId` is the id of a base part or of a variation.
type ReplaceSheetInput = { partId: string; image: File };

// Swaps the sprite of a part. The server rebuilds the avatars that use it.
export const useReplaceAvatarPartSheet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            partId,
            image,
        }: ReplaceSheetInput): Promise<AvatarPartMutationResult> => {
            const res = await api.put(
                `${AVATAR_PARTS_PATH}/${partId}/${AVATAR_PART_SUBPATHS.IMAGE}`,
                buildSheetFormData(image),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data;
        },
        onSuccess: () => invalidateAvatarParts(queryClient),
    });
};
