import type Phaser from "phaser";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { loadTextureOnDemand } from "@/features/maps/__shared__/lib/loadTextureOnDemand";

/** Loads the image of a tileset while the scene runs. False when it failed. */
export const loadTilesetTexture = (
    scene: Phaser.Scene,
    key: string,
    url: string
): Promise<boolean> =>
    loadTextureOnDemand(scene, key, (loader) => {
        loader.image(key, resolveFileUrl(url, API_BASE_URL));
    });
