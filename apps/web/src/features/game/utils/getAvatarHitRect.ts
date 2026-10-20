import { AVATAR } from "@standin/contracts";
import type { PlacedRect } from "@/features/game/utils/placed";

// The area of the avatar that answers the mouse, in world px: centered on the
// anchor and growing upwards from it.
export const getAvatarHitRect = (anchor: {
    x: number;
    y: number;
}): PlacedRect => ({
    x: anchor.x - AVATAR.hit.w / 2,
    y: anchor.y - AVATAR.hit.h,
    width: AVATAR.hit.w,
    height: AVATAR.hit.h,
});
