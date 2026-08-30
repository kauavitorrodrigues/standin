import { createFileRoute } from "@tanstack/react-router";
import { CreateMapPage } from "@/features/maps/components/pages/CreateMapPage";

export const Route = createFileRoute("/_app/_default/maps/new")({
    component: CreateMapPage,
});
