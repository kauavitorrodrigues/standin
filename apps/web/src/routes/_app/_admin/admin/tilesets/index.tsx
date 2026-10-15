import { createFileRoute } from "@tanstack/react-router";
import { TilesetsPage } from "@/features/tilesets/components/pages/TilesetsPage";

export const Route = createFileRoute("/_app/_admin/admin/tilesets/")({
    component: TilesetsPage,
});
