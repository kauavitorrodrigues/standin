import { createFileRoute } from "@tanstack/react-router";
import { spaceDetailsQueryOptions } from "@/features/spaces/queries/useDetails";
import { SpacePage } from "@/features/spaces/components/pages/space-page/SpacePage";

export const Route = createFileRoute("/_app/spaces/$spaceId")({
    beforeLoad: async ({ context, params }) => {
        const organizationId = context.organization?.id;
        if (organizationId) {
            await context.queryClient
                .query({
                    ...spaceDetailsQueryOptions(organizationId, params.spaceId),
                    staleTime: "static",
                })
                .catch(() => null);
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { spaceId } = Route.useParams();
    return <SpacePage spaceId={spaceId} />;
}
