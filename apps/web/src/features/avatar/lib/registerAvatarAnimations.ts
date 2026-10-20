import {
    AVATAR_ANIMATIONS,
    AVATAR_FRAMES,
    AVATAR_SHEET_DIRECTIONS,
    type AvatarAnimation,
} from "@standin/contracts";
import { buildAvatarAnimationKey } from "./avatarKeys";

const INFINITE_LOOP = -1;

// The parts of Phaser the registration needs, so it can run without a scene.
export type AvatarAnimationHost = {
    anims: {
        exists: (key: string) => boolean;
        generateFrameNumbers: (
            key: string,
            config: { frames: number[] }
        ) => Phaser.Types.Animations.AnimationFrame[];
        create: (config: Phaser.Types.Animations.Animation) => unknown;
    };
};

const ANIMATION_NAMES = Object.keys(AVATAR_ANIMATIONS) as AvatarAnimation[];

/**
 * Creates the animations of one avatar texture, one for each animation and
 * direction of the grid, keyed `{texture}:{ANIMATION}_{direction}`. The frames
 * come from `AVATAR_FRAMES` (the column of each frame of each
 * animation and direction). Calling it again for the same texture does nothing,
 * so it can run every time a texture becomes ready.
 */
export const registerAvatarAnimations = (
    host: AvatarAnimationHost,
    textureKey: string
): void => {
    AVATAR_SHEET_DIRECTIONS.forEach((direction) => {
        for (const animation of ANIMATION_NAMES) {
            const key = buildAvatarAnimationKey(
                textureKey,
                animation,
                direction
            );
            if (host.anims.exists(key)) continue;

            const { fps } = AVATAR_ANIMATIONS[animation];
            const frames: readonly number[] =
                AVATAR_FRAMES[animation][direction];
            host.anims.create({
                key,
                frames: host.anims.generateFrameNumbers(textureKey, {
                    frames: [...frames],
                }),
                frameRate: fps,
                repeat: INFINITE_LOOP,
            });
        }
    });
};

// The animations of a texture, to remove them with it.
export const listAvatarAnimationKeys = (textureKey: string): string[] =>
    AVATAR_SHEET_DIRECTIONS.flatMap((direction) =>
        ANIMATION_NAMES.map((animation) =>
            buildAvatarAnimationKey(textureKey, animation, direction)
        )
    );
