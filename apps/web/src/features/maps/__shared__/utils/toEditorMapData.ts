import {
    ensureAreaFloorLayer,
    type MapLayout,
    type MapRenderPayload,
} from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";

/**
 * Turns the render payload into the map data the game renderers take: the
 * layout plus the tileset images, the asset definitions and the placed objects.
 */
export const toEditorMapData = (payload: MapRenderPayload): GameMapData => {
    // The scene draws the floor layer of the areas, so a map saved without it
    // gets the empty layer here, as the editor model does.
    const layout = structuredClone(payload.map.layout) as unknown as MapLayout;
    ensureAreaFloorLayer(layout);

    return {
        id: payload.map.id,
        width: payload.map.width,
        height: payload.map.height,
        tileSize: payload.map.tileSize,
        layout: layout as unknown as GameMapData["layout"],
        tilesets: payload.tilesets.map((tileset) => ({
            tilesetName: tileset.id,
            url: tileset.url,
        })),
        assets: payload.assets,
        placed: payload.placed,
    };
};
