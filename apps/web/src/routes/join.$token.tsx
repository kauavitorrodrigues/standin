import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMeQueryOptions } from "@/features/auth/queries/getMe";
import { JoinOrganizationPage } from "@/features/organizations/invite-links/components/JoinOrganizationPage";
import { isOrganizationInvitationToken } from "@standin/contracts";

export const Route = createFileRoute("/join/$token")({
    beforeLoad: async ({ context, params }) => {
        const user = await context.queryClient
            .query({ ...getMeQueryOptions(), staleTime: "static" })
            .catch(() => null);

        // Someone signed in already has an account: a link is not for them.
        // An invitation by e-mail is, so the page lets them accept it.
        if (user && !isOrganizationInvitationToken(params.token)) {
            throw redirect({ to: "/home" });
        }
        return { user };
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { token } = Route.useParams();
    const { user } = Route.useRouteContext();
    return <JoinOrganizationPage token={token} user={user} />;
}
