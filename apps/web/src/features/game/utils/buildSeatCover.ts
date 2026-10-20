import {
    AVATAR,
    SEAT_FACINGS,
    SitActionParamsSchema,
    ASSET_ACTIONS,
    type AssetDefinition,
} from "@standin/contracts";

type AssetRef = Pick<AssetDefinition, "action" | "actionParams" | "sprite">;

// The strip of the sprite, in px from its top.
export type SeatCover = { y: number; height: number };

/**
 * The front of a piece with seats, drawn over the avatar that sits on it so
 * the piece hides its legs, like the front of a sofa does. It is the bottom of
 * the sprite itself, from `AVATAR.seatedCover` above the highest seat down to
 * the base, so it needs no art of its own. A seat that faces up has no cover,
 * since the avatar already draws behind the piece. A piece with no seat that
 * can be covered has none.
 */
export const buildSeatCover = (asset: AssetRef): SeatCover | null => {
    if (asset.action !== ASSET_ACTIONS.SIT) return null;

    const params = SitActionParamsSchema.safeParse(asset.actionParams);
    if (!params.success) return null;

    const covered = params.data.seats.filter(
        (seat) => seat.facing !== SEAT_FACINGS.UP
    );
    if (covered.length === 0) return null;

    const highestSeat = Math.max(...covered.map((seat) => seat.dy));
    const top = Math.min(
        asset.sprite.h,
        Math.max(0, asset.sprite.h - highestSeat - AVATAR.seatedCover)
    );
    const height = asset.sprite.h - top;
    if (height <= 0) return null;

    return { y: top, height };
};
