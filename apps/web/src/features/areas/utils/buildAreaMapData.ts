import type { EditorModel } from "@standin/contracts";
import type { GameMapData } from "@/features/game/types/tilemap";
import { AREA_COMPOSER_MAP_ID } from "../consts/composer";

// The map data the engine takes, from the model the composer opens: the layout,
// the image of each tileset the layout declares, and the objects with the
// definitions they need. The composer has no map in the database, so the map
// has a fixed id. The layout keeps only `name` and `firstgid` per tileset, and
// Phaser reads the image and the grid from the entry, so they are filled in here
// from the library, as the server does for a map. A tileset the library no
// longer has is left out.
export const buildAreaMapData = (model: EditorModel): GameMapData => {
    const declared = new Set(model.layout.tilesets.map(({ name }) => name));
    const used = new Set(model.placed.map(({ assetId }) => assetId));
    const byId = new Map(model.library.tilesets.map((item) => [item.id, item]));
    const tilesets = model.layout.tilesets.flatMap((entry) => {
        const tileset = byId.get(entry.name);
        if (!tileset) return [];

        return [
            {
                firstgid: entry.firstgid,
                name: entry.name,
                tilewidth: model.layout.tilewidth,
                tileheight: model.layout.tileheight,
                tilecount: tileset.tileCount,
                columns: tileset.columns,
                margin: tileset.margin,
                spacing: tileset.spacing,
                image: tileset.id,
                imagewidth: tileset.widthPx,
                imageheight: tileset.heightPx,
                tiles: [],
            },
        ];
    });

    return {
        id: AREA_COMPOSER_MAP_ID,
        width: model.width,
        height: model.height,
        tileSize: model.layout.tilewidth,
        layout: { ...model.layout, tilesets },
        tilesets: model.library.tilesets
            .filter(({ id }) => declared.has(id))
            .map(({ id, url }) => ({ tilesetName: id, url })),
        assets: model.library.assets.filter(({ id }) => used.has(id)),
        placed: model.placed,
    } as GameMapData;
};
