import { createFileRoute } from "@tanstack/react-router";
import { organizationMapsQueryOptions } from "@/features/maps/queries/useByOrganization";
import { CreateSpacePage } from "@/features/spaces/components/pages/CreateSpacePage";

export const Route = createFileRoute("/_app/spaces/new")({
    beforeLoad: async ({ context }) => {
        const organizationId = context.organization?.id;
        if (organizationId) {
            await context.queryClient
                .query({
                    ...organizationMapsQueryOptions(organizationId),
                    staleTime: "static",
                })
                .catch(() => null);
        }
    },
    component: CreateSpacePage,
});
