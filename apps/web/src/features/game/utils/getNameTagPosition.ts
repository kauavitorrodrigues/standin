import { AVATAR } from "@standin/contracts";

type Point = { x: number; y: number };

// Where the bottom center of the tag goes, in world px: over the top of the
// body of the avatar, `AVATAR.nameTagGap` apart, from the feet it stands on.
export const getNameTagPosition = (feet: Point): Point => ({
    x: feet.x,
    y: feet.y - AVATAR.visible.h - AVATAR.nameTagGap,
});
