import { createFileRoute } from "@tanstack/react-router";
import { CreateTilesetPage } from "@/features/tilesets/components/pages/CreateTilesetPage";

export const Route = createFileRoute("/_app/_admin/admin/tilesets/new")({
    component: CreateTilesetPage,
});
