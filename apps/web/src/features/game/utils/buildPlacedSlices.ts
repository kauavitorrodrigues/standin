import {
    TILE_SIZE,
    isTileOccupiedByMask,
    type AssetDefinition,
} from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";

export type PlacedSlice = {
    // The strip of the sprite this slice draws, in px from the top of the
    // sprite. Null draws the whole sprite.
    crop: { y: number; height: number } | null;
    depth: number;
};

type AssetRef = Pick<AssetDefinition, "sprite" | "footprint">;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

// Depth follows the bottom edge of the sprite, so objects lower on the map
// draw over the ones behind them.
export const getDepthAt = (bottomY: number, mapHeightPx: number): number => {
    const { MIN, MAX } = PLACED_ASSET_DEPTH;
    if (mapHeightPx <= 0) return MIN;
    return MIN + (MAX - MIN) * clamp(bottomY / mapHeightPx, 0, 1);
};

// Whether the mask leaves a whole tile of the footprint free, which is where
// something can stand inside the piece. A tile that only has a few free cells
// is not one, since the piece is still drawn around it.
const hasFreeTile = (footprint: AssetRef["footprint"]): boolean => {
    const { w, h, mask } = footprint;
    return Array.from({ length: w * h }).some(
        (_, index) =>
            !isTileOccupiedByMask(mask, index % w, Math.floor(index / w))
    );
};

/**
 * How a ground object is drawn. An object without a mask, with one row, or
 * with no whole tile free, is one slice with the depth of its base. An object
 * with a free tile is cut into one slice per row of its footprint, each with
 * the depth of the bottom of its own row, so an object standing in the free
 * tile draws over the rows behind it and under the rows in front of it. The
 * first slice also takes the part of the sprite above the footprint. The sprite
 * base is at `bottomY`. Cutting only where it matters keeps most objects one
 * sprite, which is cheaper and has no seam between slices.
 */
export const buildPlacedSlices = (
    asset: AssetRef,
    bottomY: number,
    mapHeightPx: number
): PlacedSlice[] => {
    const { h, mask } = asset.footprint;
    if (!mask || h <= 1 || !hasFreeTile(asset.footprint)) {
        return [{ crop: null, depth: getDepthAt(bottomY, mapHeightPx) }];
    }

    const spriteHeight = asset.sprite.h;

    return Array.from({ length: h }, (_, row) => {
        const rowsBelow = h - 1 - row;
        const top = row === 0 ? 0 : spriteHeight - (h - row) * TILE_SIZE;
        const bottom = spriteHeight - rowsBelow * TILE_SIZE;
        const rowBottomY = bottomY - rowsBelow * TILE_SIZE;

        return {
            crop: { y: top, height: bottom - top },
            depth:
                getDepthAt(rowBottomY, mapHeightPx) -
                PLACED_ASSET_DEPTH.SLICE_STEP,
        };
    });
};
