import { createFileRoute } from "@tanstack/react-router";
import { TilesetsPage } from "@/features/tilesets/components/pages/TilesetsPage";

export const Route = createFileRoute("/_app/_default/library/tilesets/")({
    component: TilesetsPage,
});
