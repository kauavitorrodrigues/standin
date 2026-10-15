import { createFileRoute, redirect } from "@tanstack/react-router";
import { spaceDetailsQueryOptions } from "@/features/spaces/queries/useDetails";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { SpaceMapEditorPage } from "@/features/maps/organizations/components/pages/SpaceMapEditorPage";

export const Route = createFileRoute("/_app/spaces/$spaceId_/edit")({
    beforeLoad: async ({ context, params }) => {
        const backToSpace = redirect({
            to: "/spaces/$spaceId",
            params: { spaceId: params.spaceId },
            search: {},
        });
        const organizationId = context.organization?.id;
        if (!organizationId) throw backToSpace;

        const space = await context.queryClient
            .query({
                ...spaceDetailsQueryOptions(organizationId, params.spaceId),
                staleTime: 0,
            })
            .catch(() => null);
        if (!space) throw backToSpace;

        const render = await context.queryClient
            .query({
                ...mapRenderQueryOptions(space.map.id),
                staleTime: 0,
            })
            .catch(() => null);
        if (!render?.access.canEdit) throw backToSpace;
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { spaceId } = Route.useParams();
    return <SpaceMapEditorPage spaceId={spaceId} />;
}
