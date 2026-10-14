import type { EditorModel } from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import { AREA_COMPOSER_MAP_ID } from "../consts/composer";

// The map data the engine takes, from the model the composer opens: the layout,
// the image of each tileset the layout declares, and the objects with the
// definitions they need. The composer has no map in the database, so the map
// has a fixed id.
export const buildAreaMapData = (model: EditorModel): GameMapData => {
    const declared = new Set(model.layout.tilesets.map(({ name }) => name));
    const used = new Set(model.placed.map(({ assetId }) => assetId));

    return {
        id: AREA_COMPOSER_MAP_ID,
        width: model.width,
        height: model.height,
        tileSize: model.layout.tilewidth,
        layout: model.layout,
        tilesets: model.library.tilesets
            .filter(({ id }) => declared.has(id))
            .map(({ id, url }) => ({ tilesetName: id, url })),
        assets: model.library.assets.filter(({ id }) => used.has(id)),
        placed: model.placed,
    } as GameMapData;
};
