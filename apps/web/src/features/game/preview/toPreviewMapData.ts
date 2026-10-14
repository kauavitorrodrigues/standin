import type { MapTemplatePreview } from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";

// The public preview, in the shape the game renderers take.
export const toPreviewMapData = ({
    map,
    tilesets,
    assets,
    placed,
}: MapTemplatePreview): GameMapData => ({
    id: map.id,
    width: map.width,
    height: map.height,
    tileSize: map.tileSize,
    layout: map.layout,
    tilesets: tilesets.map(({ name, url }) => ({ tilesetName: name, url })),
    assets,
    placed,
});
