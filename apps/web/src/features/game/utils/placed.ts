import {
    ASSET_PLACEMENTS,
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";

export type PlacedRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type PlacedLayout = {
    // Left edge and bottom edge of the sprite, in px.
    x: number;
    bottomY: number;
    depth: number;
    // Footprint in px, only for solid objects that sit on the ground.
    solidRect: PlacedRect | null;
};

type PlacedRef = Pick<
    PlacedAsset,
    "id" | "assetId" | "tileX" | "tileY" | "offsetX" | "offsetY" | "parentId"
>;
type AssetRef = Pick<
    AssetDefinition,
    "id" | "footprint" | "placement" | "surfaceHeightPx" | "solid"
>;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const getGroundBottomY = (placed: PlacedRef): number =>
    (placed.tileY + 1) * TILE_SIZE;

const getGroundDepth = (bottomY: number, mapHeightPx: number): number => {
    const { MIN, MAX } = PLACED_ASSET_DEPTH;
    if (mapHeightPx <= 0) return MIN;
    return MIN + (MAX - MIN) * clamp(bottomY / mapHeightPx, 0, 1);
};

/**
 * Where a placed object is drawn. The anchor is the bottom left cell of the
 * footprint: the sprite starts `footprint.offsetX` tiles left of it and its
 * base sits at the bottom of that cell. An item on a desk rests on the top of
 * its parent, `surfaceHeightPx` above the cell, and draws just over the parent.
 * The pixel offset shifts the sprite and the solid footprint from the anchor
 * cell. Ground depth follows the shifted base, so draw order stays right.
 */
export const resolvePlacedLayout = (
    placed: PlacedRef,
    assetsById: ReadonlyMap<string, AssetRef>,
    placedById: ReadonlyMap<string, PlacedRef>,
    mapHeightPx: number
): PlacedLayout | null => {
    const asset = assetsById.get(placed.assetId);
    if (!asset) return null;

    const x =
        (placed.tileX - asset.footprint.offsetX) * TILE_SIZE + placed.offsetX;

    if (asset.placement === ASSET_PLACEMENTS.SURFACE) {
        const parent = placed.parentId ? placedById.get(placed.parentId) : null;
        const parentAsset = parent ? assetsById.get(parent.assetId) : null;
        if (!parent || !parentAsset) return null;

        const parentBottomY = getGroundBottomY(parent);
        return {
            x,
            bottomY:
                getGroundBottomY(placed) -
                parentAsset.surfaceHeightPx +
                placed.offsetY,
            depth:
                getGroundDepth(parentBottomY, mapHeightPx) +
                PLACED_ASSET_DEPTH.CHILD_STEP,
            solidRect: null,
        };
    }

    const bottomY = getGroundBottomY(placed) + placed.offsetY;
    const { w, h } = asset.footprint;

    return {
        x,
        bottomY,
        depth: getGroundDepth(bottomY, mapHeightPx),
        solidRect: asset.solid
            ? {
                x: placed.tileX * TILE_SIZE + placed.offsetX,
                y: (placed.tileY - h + 1) * TILE_SIZE + placed.offsetY,
                width: w * TILE_SIZE,
                height: h * TILE_SIZE,
            }
            : null,
    };
};

// An asset plays its animation only when it has one and the animation was
// registered, which does not happen for a placeholder texture.
export const shouldPlayAnimation = (
    asset: Pick<AssetDefinition, "animation">,
    animationRegistered: boolean
): boolean => asset.animation !== null && animationRegistered;
