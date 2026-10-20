import type { AvatarAnimation, PlayerDirection } from "@standin/contracts";
import { buildAvatarAnimationKey } from "@/features/avatar/lib/avatarKeys";

// The parts of a Phaser sprite the playing needs, so it can run without one.
export type AvatarAnimationSprite = {
    scene: { anims: { exists: (key: string) => boolean } };
    anims: { play: (key: string, ignoreIfPlaying: boolean) => unknown };
};

/**
 * Plays an animation of the grid on an avatar sprite. A key that is not
 * registered (the texture is gone or never loaded) is skipped, so the avatar
 * keeps its last frame instead of logging an error on every frame.
 * `ignoreIfPlaying` keeps a running animation from restarting.
 */
export const playAvatarAnimation = (
    sprite: AvatarAnimationSprite,
    textureKey: string,
    animation: AvatarAnimation,
    direction: PlayerDirection
): void => {
    const key = buildAvatarAnimationKey(textureKey, animation, direction);
    if (!sprite.scene.anims.exists(key)) return;

    sprite.anims.play(key, true);
};
