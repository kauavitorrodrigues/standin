import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, UserUpdateSchemaType } from "@standin/contracts";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { api } from "@/lib/axios/api";
import { USER_ME_PATH } from "../consts/editProfile";

// Saves the profile of the signed in person and refreshes who they are, which
// is what every name in the app is read from.
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UserUpdateSchemaType): Promise<User> => {
            const res = await api.put<{ user: User }>(USER_ME_PATH, data);
            return res.data.user;
        },
        onSuccess: () =>
            queryClient.invalidateQueries({
                queryKey: getMeQueryOptions().queryKey,
            }),
    });
};
