import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@standin/contracts";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { api } from "@/lib/axios/api";
import { PROFILE_PICTURE_PATH } from "../consts/profilePicture";
import { buildProfilePictureFormData } from "../utils/buildProfilePictureFormData";
import { invalidateProfilePictureQueries } from "../utils/invalidateProfilePictureQueries";

// Sends the photo as the person chose it and takes the saved person back: the
// app's copy of who they are carries the new picture, and the lists that draw
// pictures are loaded again.
export const useSetProfilePicture = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File): Promise<User> => {
            const res = await api.put<{ user: User }>(
                PROFILE_PICTURE_PATH,
                buildProfilePictureFormData(file),
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return res.data.user;
        },
        onSuccess: (user) => {
            queryClient.setQueryData(getMeQueryOptions().queryKey, user);
            return invalidateProfilePictureQueries(queryClient);
        },
    });
};
