import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import { getDepthAt } from "@/features/game/utils/buildPlacedSlices";

type Params = {
    // The center of the avatar and its radius, in px. The feet are at the
    // bottom of the circle.
    centerY: number;
    radius: number;
    mapHeightPx: number;
    isSitting: boolean;
};

// The depth of an avatar on the same scale as the placed objects, which follow
// the bottom of their sprite. Walking behind an object puts the feet above its
// base, so the avatar draws under it, and walking in front of it draws over.
// The footprint is solid, so the avatar never reaches the base itself. A
// seated avatar draws over everything.
export const getAvatarDepth = ({
    centerY,
    radius,
    mapHeightPx,
    isSitting,
}: Params): number => {
    if (isSitting) return PLACED_ASSET_DEPTH.SEATED_AVATAR;
    return (
        getDepthAt(centerY + radius, mapHeightPx) +
        PLACED_ASSET_DEPTH.AVATAR_STEP
    );
};
