import { createFileRoute } from "@tanstack/react-router";
import { SpaceDetailsPage } from "@/features/spaces/components/pages/SpaceDetailsPage";

export const Route = createFileRoute("/_app/spaces/$spaceId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { spaceId } = Route.useParams();
    return <SpaceDetailsPage spaceId={spaceId} />;
}
