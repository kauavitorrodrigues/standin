import { createFileRoute, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@standin/contracts";
import { AuthPage } from "@/components/pages/AuthPage";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { authSearchSchema } from "@/features/auth/schemas/authSearch";
import { takeReturnPath } from "@/features/auth/lib/returnTo";

export const Route = createFileRoute("/")({
    validateSearch: authSearchSchema,
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        if (user) {
            // Just signed in with a page waiting: the person goes there.
            const returnPath = takeReturnPath();
            if (returnPath) throw redirect({ href: returnPath });

            const isAdmin = user.role === USER_ROLES.ADMIN;
            throw redirect({ to: isAdmin ? "/admin/assets" : "/home" });
        }
    },
    component: AuthPage,
});
