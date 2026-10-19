import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AvatarConfig } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { AVATAR_API_PATHS } from "../consts/editor/paths";
import { MY_AVATAR_QUERY_KEY } from "../consts/editor/queryKeys";
import type { MyAvatar } from "../types/editor";
import { invalidateAvatarEditor } from "../utils/invalidateAvatarEditor";

// Replaces the whole avatar. The server assembles the sheet and answers with
// the new `avatarSheetFileId`, so the avatar of the person is updated from the
// answer and the editor, which shows what they use now, is read again.
export const useSaveAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (config: AvatarConfig): Promise<MyAvatar> => {
            const res = await api.put(AVATAR_API_PATHS.ME, config);
            return res.data;
        },
        onSuccess: (avatar) => {
            queryClient.setQueryData([MY_AVATAR_QUERY_KEY], avatar);
            return invalidateAvatarEditor(queryClient);
        },
    });
};
