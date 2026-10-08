import Phaser from "phaser";
import { rebaseAssetUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
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

    loader.tilemapTiledJSON(
        buildMapAssetKey(map.id),
        rebaseAssetUrl(map.mapJsonUrl, API_BASE_URL)
    );
    map.tilesets.forEach((tileset) => {
        loader.image(
            buildTilesetAssetKey(map.id, tileset.tilesetName),
            rebaseAssetUrl(tileset.url, API_BASE_URL)
        );
    });
};
