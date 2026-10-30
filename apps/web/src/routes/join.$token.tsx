import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { JoinOrganizationPage } from "@/features/organizations/invite-links/components/JoinOrganizationPage";

export const Route = createFileRoute("/join/$token")({
    beforeLoad: async ({ context }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        // Someone already signed in has an account: the link is not for them.
        if (user) throw redirect({ to: "/home" });
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { token } = Route.useParams();
    return <JoinOrganizationPage token={token} />;
}
