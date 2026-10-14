import type { AssetDefinition } from "@standin/contracts";
import { buildAssetTextureKey } from "@/features/game/utils/map";
import type { AssetTextureSource } from "@/features/editor/types/asset-texture-source";

/**
 * The key and the way to load the texture of an asset, the same as the game
 * does: `asset-tex:{assetId}`, and a spritesheet of `sprite` sized frames when
 * the asset is animated.
 */
export const getAssetTextureSource = (
    asset: Pick<AssetDefinition, "id" | "url" | "animation" | "sprite">
): AssetTextureSource => ({
    key: buildAssetTextureKey(asset.id),
    url: asset.url,
    frame:
        asset.animation === null
            ? null
            : { width: asset.sprite.w, height: asset.sprite.h },
});
