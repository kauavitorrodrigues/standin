import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios/api";
import { AVATAR_API_PATHS } from "../consts/editor/paths";
import { invalidateOwnAvatar } from "../utils/invalidateAvatarEditor";

// Removes the choices of the person. They go back to the default base, or to
// the ghost when there is none.
export const useClearAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<void> => {
            await api.delete(AVATAR_API_PATHS.ME);
        },
        onSuccess: () => invalidateOwnAvatar(queryClient),
    });
};
