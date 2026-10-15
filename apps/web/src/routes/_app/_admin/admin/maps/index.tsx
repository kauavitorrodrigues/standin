import { createFileRoute } from "@tanstack/react-router";
import { TemplatesPage } from "@/features/maps/templates/components/pages/TemplatesPage";

export const Route = createFileRoute("/_app/_admin/admin/maps/")({
    component: TemplatesPage,
});
