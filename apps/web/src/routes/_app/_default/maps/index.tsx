import { createFileRoute } from "@tanstack/react-router";
import { MapsPage } from "@/features/maps/components/pages/MapsPage";

export const Route = createFileRoute("/_app/_default/maps/")({
    component: MapsPage,
});
