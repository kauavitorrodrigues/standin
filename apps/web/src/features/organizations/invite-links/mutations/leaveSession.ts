import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { api } from "@/lib/axios/api";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";

// Signs out in place, so the invited person can use another account and
// stay on the join page.
export const useLeaveSession = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.post("/auth/signout");
        },
        onSuccess: async () => {
            queryClient.removeQueries({
                queryKey: getMeQueryOptions().queryKey,
            });
            // The route reads the session again and finds nobody.
            await router.invalidate();
        },
    });
};
