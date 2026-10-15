import {
    ASSET_PLACEMENTS,
    cellsInside,
    occupiedCells,
    splitPixelAnchor,
    TILE_SIZE,
    type AssetDefinition,
    type PixelAnchor,
    type PlacedAsset,
} from "@standin/contracts";

import { findNearestSurfaceCell } from "@/features/editor/utils/findNearestSurfaceCell";

const clamp = (value: number, min: number, max: number): number => {
    // An item bigger than the top has no spot that fits: keep the value and
    // let the placement rule say why.
    if (min > max) return value;
    return Math.min(max, Math.max(min, value));
};

export type SurfaceParent = { placed: PlacedAsset; asset: AssetDefinition };

// Keeps the footprint of a SURFACE item inside the top of its parent, down to
// the pixel. `left` and `bottom` are the edges of the footprint in world px.
// When the parent has a footprint mask and the item would stand on a free tile,
// it moves to the grid position of the nearest cells the parent occupies.
export const clampToSurface = (
    left: number,
    bottom: number,
    asset: AssetDefinition,
    parent: SurfaceParent
): { left: number; bottom: number } => {
    const width = asset.footprint.w * TILE_SIZE;
    const height = asset.footprint.h * TILE_SIZE;
    const parentLeft = parent.placed.tileX * TILE_SIZE + parent.placed.offsetX;
    const parentBottom =
        (parent.placed.tileY + 1) * TILE_SIZE + parent.placed.offsetY;
    const parentTop = parentBottom - parent.asset.footprint.h * TILE_SIZE;
    const parentWidth = parent.asset.footprint.w * TILE_SIZE;

    const inside = {
        left: clamp(left, parentLeft, parentLeft + parentWidth - width),
        bottom: clamp(bottom, parentTop + height, parentBottom),
    };
    if (!parent.asset.footprint.mask) return inside;

    return snapToOccupied(inside, asset, parent);
};

const snapToOccupied = (
    inside: { left: number; bottom: number },
    asset: AssetDefinition,
    parent: SurfaceParent
): { left: number; bottom: number } => {
    const { tileX, tileY } = splitPixelAnchor(inside.left, inside.bottom);
    const surface = occupiedCells(
        parent.asset,
        parent.placed.tileX,
        parent.placed.tileY
    );
    if (cellsInside(occupiedCells(asset, tileX, tileY), surface)) return inside;

    const nearest = findNearestSurfaceCell(
        [tileX, tileY],
        asset,
        parent.placed,
        parent.asset
    );
    if (!nearest) return inside;
    return {
        left: nearest[0] * TILE_SIZE,
        bottom: (nearest[1] + 1) * TILE_SIZE,
    };
};

type Pointer = { x: number; y: number };

// The anchor that puts the middle of the footprint under the pointer, with no
// snapping. Given the parent top (a SURFACE item on a desk), the footprint is
// kept inside it.
export const planFreePosition = (
    pointer: Pointer,
    asset: AssetDefinition,
    parent?: SurfaceParent
): PixelAnchor => {
    const left = pointer.x - (asset.footprint.w * TILE_SIZE) / 2;
    const bottom = pointer.y + (asset.footprint.h * TILE_SIZE) / 2;

    if (parent && asset.placement === ASSET_PLACEMENTS.SURFACE) {
        const inside = clampToSurface(left, bottom, asset, parent);
        return splitPixelAnchor(inside.left, inside.bottom);
    }
    return splitPixelAnchor(left, bottom);
};
