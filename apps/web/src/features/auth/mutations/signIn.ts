import { useMutation } from "@tanstack/react-query";
import type { SignInSchemaType, User } from "@standin/contracts";
import { api } from "@/lib/axios/api";
import { queryClient } from "@/lib/tanstack/queryClient";
import { getMeQueryOptions } from "../queries/getMe";

export const useSignIn = () => {
    return useMutation({
        mutationFn: async (data: SignInSchemaType) => {
            const { data: response } = await api.post<{ user: User }>(
                "/auth/signin",
                data,
            );
            return response.user;
        },
        onSuccess: (user) => {
            queryClient.setQueryData(getMeQueryOptions().queryKey, user);
        },
    });
};
