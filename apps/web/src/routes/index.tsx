import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthPage } from "@/components/pages/AuthPage";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";

export const Route = createFileRoute("/")({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        if (user) {
            throw redirect({ to: "/home" });
        }
    },
    component: AuthPage,
});
