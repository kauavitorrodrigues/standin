import type Phaser from "phaser";
import { AVATAR_GHOST_TEXTURE_KEY } from "@/features/avatar/consts/textures";
import {
    AVATAR_FIRST_FRAME,
    AVATAR_SPRITE_ORIGIN,
} from "@/features/game/consts/avatar-sprite";

/**
 * The avatar that stands for a spawn: the ghost every avatar draws until its
 * own sheet is ready, with its feet on the point (px) where people appear.
 */
export const createSpawnAvatar = (
    scene: Phaser.Scene,
    x: number,
    y: number
): Phaser.GameObjects.Sprite =>
    scene.add
        .sprite(x, y, AVATAR_GHOST_TEXTURE_KEY, AVATAR_FIRST_FRAME)
        .setOrigin(AVATAR_SPRITE_ORIGIN.x, AVATAR_SPRITE_ORIGIN.y);
