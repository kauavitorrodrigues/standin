import { createFileRoute, redirect } from "@tanstack/react-router";
import { templateDetailsQueryOptions } from "@/features/maps/templates/queries/useDetails";
import { mapRenderQueryOptions } from "@/features/game/queries/useMapRender";
import { TemplateMapEditorPage } from "@/features/maps/templates/components/pages/TemplateMapEditorPage";

export const Route = createFileRoute(
    "/_app/_admin/admin/maps/$templateId/edit"
)({
    beforeLoad: async ({ context, params }) => {
        const template = await context.queryClient
            .query({
                ...templateDetailsQueryOptions(params.templateId),
                staleTime: 0,
            })
            .catch(() => null);
        if (!template) {
            throw redirect({ to: "/admin/maps" });
        }

        const render = await context.queryClient
            .query({
                ...mapRenderQueryOptions(template.mapId),
                staleTime: 0,
            })
            .catch(() => null);
        if (!render?.access.canEdit) {
            throw redirect({ to: "/admin/maps" });
        }
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { templateId } = Route.useParams();
    return <TemplateMapEditorPage templateId={templateId} />;
}
