import { createFileRoute } from "@tanstack/react-router";
import { SoundsPage } from "@/features/soundboard/components/pages/SoundsPage";

export const Route = createFileRoute("/_app/_default/library/sounds/")({
    component: SoundsPage,
});
