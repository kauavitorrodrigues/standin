import type { AvatarAnimation, PlayerDirection } from "@standin/contracts";
import { buildAvatarAnimationKey } from "@/features/avatar/lib/avatarKeys";

// The parts of a Phaser sprite the playing needs, so it can run without one.
export type AvatarAnimationSprite = {
    scene: { anims: { exists: (key: string) => boolean } };
    anims: {
        play: (key: string, ignoreIfPlaying: boolean) => unknown;
        currentAnim?: { key: string } | null;
    };
};

/**
 * Plays an animation of the grid on an avatar sprite. A key that is not
 * registered (the texture is gone or never loaded) is skipped, so the avatar
 * keeps its last frame instead of logging an error on every frame.
 * `ignoreIfPlaying` keeps a running animation from restarting, and the current
 * key check does the same once a one-shot one (sitting down) has finished and
 * holds its last frame, which would otherwise start over on every call.
 */
export const playAvatarAnimation = (
    sprite: AvatarAnimationSprite,
    textureKey: string,
    animation: AvatarAnimation,
    direction: PlayerDirection
): void => {
    const key = buildAvatarAnimationKey(textureKey, animation, direction);
    if (!sprite.scene.anims.exists(key)) return;
    if (sprite.anims.currentAnim?.key === key) return;

    sprite.anims.play(key, true);
};
