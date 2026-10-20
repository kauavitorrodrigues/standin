import { PLAYER_DIRECTIONS, type PlayerDirection } from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import { getDepthAt } from "@/features/game/utils/buildPlacedSlices";

type Params = {
    // The Y of the avatar feet, in px.
    feetY: number;
    mapHeightPx: number;
    isSitting: boolean;
    // The way the seat faces, when the avatar is sitting.
    seatDirection?: PlayerDirection | null;
    // The depth of the piece the avatar sits on, when it is known.
    seatDepth?: number | null;
};

// The depth of an avatar on the same scale as the placed objects, which follow
// the bottom of their sprite. Walking behind an object puts the feet above its
// base, so the avatar draws under it, and walking in front of it draws over.
// The footprint is solid, so the avatar never reaches the base itself. A
// seated avatar draws just over the piece it sits on, and the front of that
// piece draws over it. Without the piece it draws over everything. The
// exception is a seat that faces up:
// the avatar turns its back to the viewer and the back of the chair covers it,
// so it keeps the depth of its feet like an avatar standing there.
export const getAvatarDepth = ({
    feetY,
    mapHeightPx,
    isSitting,
    seatDirection = null,
    seatDepth = null,
}: Params): number => {
    const isBehindChair = seatDirection === PLAYER_DIRECTIONS.UP;
    if (isSitting && !isBehindChair) {
        if (seatDepth === null) return PLACED_ASSET_DEPTH.SEATED_AVATAR;

        return seatDepth + PLACED_ASSET_DEPTH.SEATED_ON_PIECE_STEP;
    }

    return getDepthAt(feetY, mapHeightPx) + PLACED_ASSET_DEPTH.AVATAR_STEP;
};
