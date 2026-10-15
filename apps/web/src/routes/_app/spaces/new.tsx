import { createFileRoute } from "@tanstack/react-router";
import { CreateSpacePage } from "@/features/spaces/components/pages/CreateSpacePage";

export const Route = createFileRoute("/_app/spaces/new")({
    component: CreateSpacePage,
});
