import Phaser from "phaser";
import {
    buildMapAssetKey,
    buildTilesetAssetKey,
} from "@/features/game/utils/map";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";
import type { MapAssetManifest } from "@/features/game/types/tilemap";

export const loadMapAssets = (
    loader: Phaser.Loader.LoaderPlugin,
    map: MapAssetManifest
): void => {
    loader
        .off(Phaser.Loader.Events.FILE_LOAD_ERROR)
        .on(
            Phaser.Loader.Events.FILE_LOAD_ERROR,
            (file: Phaser.Loader.File) => {
                console.warn(
                    GAME_DIAGNOSTIC_MESSAGES.assetLoadFailed(file.key)
                );
            }
        );

    loader.tilemapTiledJSON(buildMapAssetKey(map.id), map.mapJsonUrl);
    map.tilesets.forEach((tileset) => {
        loader.image(
            buildTilesetAssetKey(map.id, tileset.tilesetName),
            tileset.url
        );
    });
};
