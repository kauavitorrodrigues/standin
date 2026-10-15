import { createFileRoute } from "@tanstack/react-router";
import { CreateSpacePage } from "@/features/spaces/components/pages/CreateSpacePage";
import { templatesQueryOptions } from "@/features/maps/templates/queries/useAll";

export const Route = createFileRoute("/_app/spaces/new")({
    // The templates are in the cache before the page opens, so the list does
    // not jump when they arrive. Whoever cannot read them gets the blank map.
    beforeLoad: async ({ context }) => {
        await context.queryClient
            .query({ ...templatesQueryOptions(), staleTime: 60_000 })
            .catch(() => []);
    },
    component: CreateSpacePage,
});
