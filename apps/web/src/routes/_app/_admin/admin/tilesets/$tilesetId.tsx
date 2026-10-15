import { createFileRoute } from "@tanstack/react-router";
import { TilesetDetailPage } from "@/features/tilesets/components/pages/TilesetDetailPage";

export const Route = createFileRoute("/_app/_admin/admin/tilesets/$tilesetId")({
    component: TilesetDetailRoute,
});

function TilesetDetailRoute() {
    const { tilesetId } = Route.useParams();
    return <TilesetDetailPage tilesetId={tilesetId} />;
}
