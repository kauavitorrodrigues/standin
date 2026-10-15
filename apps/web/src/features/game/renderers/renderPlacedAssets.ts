import type Phaser from "phaser";
import type { AssetDefinition, PlacedAsset } from "@standin/contracts";
import {
    buildAssetAnimationKey,
    buildAssetTextureKey,
} from "@/features/game/utils/map";
import {
    resolvePlacedLayout,
    shouldPlayAnimation,
} from "@/features/game/utils/placed";

/**
 * Draws every placed object of the map as a sprite over the texture of its
 * asset: frame 0 when static, the `asset:{assetId}` animation when animated.
 * An object whose footprint has a mask is drawn as one cropped sprite per
 * footprint row, each at its own depth. Solid objects on the ground get a
 * static zone over each rectangle of their footprint in the given group. A
 * view with no physics passes no group and gets the sprites only.
 */
export const renderPlacedAssets = (
    scene: Phaser.Scene,
    placed: PlacedAsset[],
    assets: AssetDefinition[],
    mapHeightPx: number,
    solidGroup?: Phaser.Physics.Arcade.StaticGroup
): Phaser.GameObjects.Sprite[] => {
    const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
    const placedById = new Map(placed.map((item) => [item.id, item]));
    const sprites: Phaser.GameObjects.Sprite[] = [];

    for (const item of placed) {
        const asset = assetsById.get(item.assetId);
        const layout = resolvePlacedLayout(
            item,
            assetsById,
            placedById,
            mapHeightPx
        );
        if (!asset || !layout) continue;

        const textureKey = buildAssetTextureKey(asset.id);
        if (!scene.textures.exists(textureKey)) continue;

        const animationKey = buildAssetAnimationKey(asset.id);
        const animated = shouldPlayAnimation(
            asset,
            scene.anims.exists(animationKey)
        );

        for (const slice of layout.slices) {
            const sprite = scene.add.sprite(
                layout.x,
                layout.bottomY,
                textureKey
            );
            sprite.setOrigin(0, 1);
            sprite.setDepth(slice.depth);
            sprite.setName(item.id);
            if (slice.crop) {
                sprite.setCrop(
                    0,
                    slice.crop.y,
                    asset.sprite.w,
                    slice.crop.height
                );
            }
            if (animated) sprite.play(animationKey);
            sprites.push(sprite);
        }

        if (!solidGroup) continue;

        for (const { x, y, width, height } of layout.solidRects) {
            const zone = scene.add.zone(
                x + width / 2,
                y + height / 2,
                width,
                height
            );
            scene.physics.add.existing(zone, true);
            solidGroup.add(zone);
        }
    }

    return sprites;
};
