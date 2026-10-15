import type Phaser from "phaser";
import type { AssetDefinition } from "@standin/contracts";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { ensureAssetTextures } from "@/features/game/renderers/ensureAssetTextures";
import { registerAssetAnimations } from "@/features/game/renderers/registerAssetAnimations";
import { loadTextureOnDemand } from "@/features/editor/lib/loadTextureOnDemand";
import { getAssetTextureSource } from "@/features/editor/utils/getAssetTextureSource";

/**
 * Loads the texture of an asset while the scene runs, under `asset-tex:{id}`
 * (a spritesheet when animated), and registers its animation. A failed load
 * falls back to the same placeholder the game draws, so the key always exists
 * when the promise resolves.
 */
export const loadAssetTexture = async (
    scene: Phaser.Scene,
    asset: AssetDefinition
): Promise<void> => {
    const { key, url, frame } = getAssetTextureSource(asset);
    const resolvedUrl = resolveFileUrl(url, API_BASE_URL);

    const loaded = await loadTextureOnDemand(scene, key, (loader) => {
        if (frame === null) {
            loader.image(key, resolvedUrl);
            return;
        }
        loader.spritesheet(key, resolvedUrl, {
            frameWidth: frame.width,
            frameHeight: frame.height,
        });
    });

    // The game can be destroyed while the file loads.
    if (!scene.textures) return;

    if (!loaded) ensureAssetTextures(scene.textures, [asset]);
    registerAssetAnimations(scene, [asset]);
};
