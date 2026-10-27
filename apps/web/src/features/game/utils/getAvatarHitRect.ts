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

// Same rect written into `out`, for the per-frame hover feed that must not
// allocate a rect for every avatar on every frame.
export const writeAvatarHitRect = (
    anchor: { x: number; y: number },
    out: PlacedRect
): PlacedRect => {
    out.x = anchor.x - AVATAR.hit.w / 2;
    out.y = anchor.y - AVATAR.hit.h;
    out.width = AVATAR.hit.w;
    out.height = AVATAR.hit.h;
    return out;
};
