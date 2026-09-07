import { useNavigate } from "@tanstack/react-router";
import { queryClient } from "@/lib/tanstack/queryClient";
import { getMeQueryOptions } from "../queries/getMe";
import { useSignOut } from "../mutations/signOut";

export function useLogout() {
    const navigate = useNavigate();
    const signOutMutation = useSignOut();

    return async () => {
        await signOutMutation.mutateAsync(undefined, {
            onSuccess: () => {
                queryClient.setQueryData(
                    getMeQueryOptions().queryKey,
                    undefined
                );
                navigate({ to: "/" });
            },
        });
    };
}
