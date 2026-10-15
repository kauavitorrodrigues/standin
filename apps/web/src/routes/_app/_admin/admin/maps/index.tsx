import { createFileRoute } from "@tanstack/react-router";
import { MapsPage } from "@/features/admin/components/pages/MapsPage";

export const Route = createFileRoute("/_app/_admin/admin/maps/")({
    component: MapsPage,
});
