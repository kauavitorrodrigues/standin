import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .ensureQueryData(getMeQueryOptions())
            .catch(() => null);

        if (!user) {
            throw redirect({ to: "/" });
        }

        return { user };
    },
    component: Outlet,
});
