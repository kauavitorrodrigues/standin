import { useMutation } from "@tanstack/react-query";
import type { User, UserDataSchemaType } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { queryClient } from "@/lib/tanstack/queryClient";
import { getMeQueryOptions } from "../queries/getMe";

export const useSignUp = () => {
    return useMutation({
        mutationFn: async (data: UserDataSchemaType) => {
            const { data: response } = await api.post<{ user: User }>(
                "/auth/signup",
                data,
            );
            return response.user;
        },
        onSuccess: (user) => {
            queryClient.setQueryData(getMeQueryOptions().queryKey, user);
        },
    });
};
