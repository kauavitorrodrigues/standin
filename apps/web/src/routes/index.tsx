import { createFileRoute, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@standin/contracts";
import { AuthPage } from "@/components/pages/AuthPage";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";

export const Route = createFileRoute("/")({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        if (user) {
            const isAdmin = user.role === USER_ROLES.ADMIN;
            throw redirect({ to: isAdmin ? "/admin/assets" : "/home" });
        }
    },
    component: AuthPage,
});
