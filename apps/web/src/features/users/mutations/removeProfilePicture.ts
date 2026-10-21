import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@standin/contracts";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { api } from "@/lib/axios/api";
import { PROFILE_PICTURE_PATH } from "../consts/profilePicture";
import { invalidateProfilePictureQueries } from "../utils/invalidateProfilePictureQueries";

// Removes the picture, so the initial shows again everywhere.
export const useRemoveProfilePicture = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<User> => {
            const res = await api.delete<{ user: User }>(PROFILE_PICTURE_PATH);
            return res.data.user;
        },
        onSuccess: (user) => {
            queryClient.setQueryData(getMeQueryOptions().queryKey, user);
            return invalidateProfilePictureQueries(queryClient);
        },
    });
};
