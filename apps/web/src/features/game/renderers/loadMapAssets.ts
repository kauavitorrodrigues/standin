import Phaser from "phaser";
import type { AssetDefinition } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import {
    buildAssetTextureKey,
    buildMapAssetKey,
    buildTilesetAssetKey,
} from "@/features/game/utils/map";
import { GAME_DIAGNOSTIC_MESSAGES } from "@/features/game/consts/diagnostics";
import type { GameMapData } from "@/features/game/types/tilemap";

// One texture per asset. A static asset is a plain image, an animated one is
// a spritesheet whose frames are the equal slices of its horizontal strip.
const loadAssetTexture = (
    loader: Phaser.Loader.LoaderPlugin,
    asset: AssetDefinition
): void => {
    const key = buildAssetTextureKey(asset.id);
    if (loader.textureManager.exists(key)) return;

    const url = resolveFileUrl(asset.url, API_BASE_URL);
    if (asset.animation === null) {
        loader.image(key, url);
        return;
    }

    loader.spritesheet(key, url, {
        frameWidth: asset.sprite.w,
        frameHeight: asset.sprite.h,
    });
};

export const loadMapAssets = (
    loader: Phaser.Loader.LoaderPlugin,
    map: GameMapData
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

    // The layout is plain data served with the space, so the loader takes
    // the object itself instead of a url.
    loader.tilemapTiledJSON(buildMapAssetKey(map.id), map.layout);
    map.tilesets.forEach((tileset) => {
        loader.image(
            buildTilesetAssetKey(map.id, tileset.tilesetName),
            resolveFileUrl(tileset.url, API_BASE_URL)
        );
    });
    (map.assets ?? []).forEach((asset) => loadAssetTexture(loader, asset));
};
