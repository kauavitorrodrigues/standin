import { createFileRoute } from "@tanstack/react-router";
import { AreasPage } from "@/features/areas/components/pages/AreasPage";

export const Route = createFileRoute("/_app/_admin/admin/areas/")({
    component: AreasPage,
});
