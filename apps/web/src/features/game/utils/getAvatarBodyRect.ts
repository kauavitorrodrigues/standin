import { AVATAR } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

type Point = { x: number; y: number };

export type AvatarBody = { w: number; h: number };

// The body that blocks an avatar whose feet are at the point: `AVATAR.body`,
// centered on the feet and growing upwards.
export const getAvatarBodyRect = (
    feet: Point,
    body: AvatarBody = AVATAR.body
): PlacedRect => ({
    x: feet.x - body.w / 2,
    y: feet.y - body.h,
    width: body.w,
    height: body.h,
});
