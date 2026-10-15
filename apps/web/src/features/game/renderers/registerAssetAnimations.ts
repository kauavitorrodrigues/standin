import type { AssetDefinition } from "@standin/contracts";
import {
    buildAssetAnimationKey,
    buildAssetTextureKey,
} from "@/features/game/utils/map";

const FIRST_FRAME = 0;
const MS_PER_SECOND = 1000;

// The parts of Phaser the registration needs, so it can run without a scene.
type AnimationHost = {
    textures: {
        exists: (key: string) => boolean;
        get: (key: string) => { getFrameNames: () => string[] };
    };
    anims: {
        exists: (key: string) => boolean;
        generateFrameNumbers: (
            key: string,
            config: { start: number; end: number }
        ) => Phaser.Types.Animations.AnimationFrame[];
        create: (config: Phaser.Types.Animations.Animation) => unknown;
    };
};

/**
 * Creates one Phaser animation per animated asset, keyed `asset:{assetId}`,
 * over the frames of its texture strip.
 *
 * In Phaser 3.90 a `frameRate` makes every frame last `1000 / frameRate` ms,
 * so `1000 / frameDurationMs` gives each frame exactly `frameDurationMs`.
 * `repeat` follows Phaser as well, where -1 is an infinite loop. Assets whose
 * texture is missing or has fewer frames than `frameCount` (a placeholder)
 * are skipped.
 */
export const registerAssetAnimations = (
    host: AnimationHost,
    assets: Pick<AssetDefinition, "id" | "animation">[]
): void => {
    for (const asset of assets) {
        const { animation } = asset;
        const textureKey = buildAssetTextureKey(asset.id);
        const animationKey = buildAssetAnimationKey(asset.id);

        if (!animation || host.anims.exists(animationKey)) continue;
        if (!host.textures.exists(textureKey)) continue;

        const available = host.textures.get(textureKey).getFrameNames().length;
        if (available < animation.frameCount) continue;

        host.anims.create({
            key: animationKey,
            frames: host.anims.generateFrameNumbers(textureKey, {
                start: FIRST_FRAME,
                end: animation.frameCount - 1,
            }),
            frameRate: MS_PER_SECOND / animation.frameDurationMs,
            repeat: animation.repeat,
        });
    }
};
