import type Phaser from "phaser";
import {
    buildMapAssetKey,
    buildTilesetAssetKey,
} from "@/features/game/utils/map";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";
import type { MapAssetManifest } from "@/features/game/types/tilemap";

export type BuiltTilemap = {
    tilemap: Phaser.Tilemaps.Tilemap;
    tilesets: Phaser.Tilemaps.Tileset[];
};

const addTilesetImage = (
    tilemap: Phaser.Tilemaps.Tilemap,
    mapId: string,
    tileset: MapAssetManifest["tilesets"][number]
): Phaser.Tilemaps.Tileset | null => {
    const addedTileset = tilemap.addTilesetImage(
        tileset.tilesetName,
        buildTilesetAssetKey(mapId, tileset.tilesetName)
    );

    if (!addedTileset) {
        console.warn(
            GAME_DIAGNOSTIC_MESSAGES.tilesetImageMissing(tileset.tilesetName)
        );
    }

    return addedTileset;
};

export const buildTilemap = (
    scene: Phaser.Scene,
    map: MapAssetManifest
): BuiltTilemap => {
    const tilemap = scene.make.tilemap({ key: buildMapAssetKey(map.id) });

    const tilesets = map.tilesets
        .map((tileset) => addTilesetImage(tilemap, map.id, tileset))
        .filter(
            (tileset): tileset is Phaser.Tilemaps.Tileset => tileset !== null
        );

    return { tilemap, tilesets };
};
