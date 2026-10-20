import type { AvatarAnimation, PlayerDirection } from "@standin/contracts";
import {
    AVATAR_TEXTURE_KEY_PREFIX,
    AVATAR_TEXTURE_KEY_SEPARATOR,
} from "../consts/textures";

// The texture of the sheet of a file, `avatar-sheet:{fileId}`.
export const buildAvatarTextureKey = (fileId: string): string =>
    [AVATAR_TEXTURE_KEY_PREFIX, fileId].join(AVATAR_TEXTURE_KEY_SEPARATOR);

const ANIMATION_PART_SEPARATOR = "_";

// The animation of a texture, `{texture}:{ANIMATION}_{direction}`, for example
// `avatar-sheet:ghost:WALK_left`.
export const buildAvatarAnimationKey = (
    textureKey: string,
    animation: AvatarAnimation,
    direction: PlayerDirection
): string =>
    [textureKey, [animation, direction].join(ANIMATION_PART_SEPARATOR)].join(
        AVATAR_TEXTURE_KEY_SEPARATOR
    );
