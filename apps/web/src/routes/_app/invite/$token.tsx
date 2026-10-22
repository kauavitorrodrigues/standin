import { createFileRoute } from "@tanstack/react-router";
import { InvitePage } from "@/features/spaces/guests/components/pages/InvitePage";

export const Route = createFileRoute("/_app/invite/$token")({
    component: RouteComponent,
});

function RouteComponent() {
    const { token } = Route.useParams();
    return <InvitePage token={token} />;
}
