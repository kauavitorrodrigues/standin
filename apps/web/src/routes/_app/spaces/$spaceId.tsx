import { createFileRoute } from "@tanstack/react-router";
import { spaceViewQueryOptions } from "@/features/spaces/guests/queries/spaceView";
import { spaceSearchSchema } from "@/features/spaces/schemas/spaceSearch";
import { SpaceEntry } from "@/features/spaces/guests/components/pages/SpaceEntry";

export const Route = createFileRoute("/_app/spaces/$spaceId")({
    validateSearch: spaceSearchSchema,
    // The person decides nothing about what they are: the server tells a
    // member from a guest, so the space is loaded by its id alone and the
    // active organization is not needed to open it.
    beforeLoad: async ({ context, params }) => {
        await context.queryClient
            .query({
                ...spaceViewQueryOptions(params.spaceId),
                staleTime: "static",
            })
            .catch(() => null);
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { spaceId } = Route.useParams();
    return <SpaceEntry spaceId={spaceId} />;
}
