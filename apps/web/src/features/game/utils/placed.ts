import {
    ASSET_PLACEMENTS,
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import { PLACED_ASSET_DEPTH } from "@/features/game/consts/placed-assets";
import {
    buildPlacedSlices,
    getDepthAt,
    type PlacedSlice,
} from "@/features/game/utils/buildPlacedSlices";
import { buildSolidRects } from "@/features/game/utils/buildSolidRects";

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
    // Depth of the object taken at its base. Selection and the objects on top
    // of it follow this value.
    depth: number;
    // How the sprite is drawn: one slice, or one per footprint row when the
    // footprint has a mask. Always at least one.
    slices: PlacedSlice[];
    // Footprint in px, only for solid objects that sit on the ground. One
    // rectangle per run of occupied tiles.
    solidRects: PlacedRect[];
};

type PlacedRef = Pick<
    PlacedAsset,
    "id" | "assetId" | "tileX" | "tileY" | "offsetX" | "offsetY" | "parentId"
>;
type AssetRef = Pick<
    AssetDefinition,
    "id" | "footprint" | "placement" | "surfaceHeightPx" | "solid" | "sprite"
>;

const clamp = (value: number, min: number, max: number): number =>
    Math.min(max, Math.max(min, value));

const getGroundBottomY = (placed: PlacedRef): number =>
    (placed.tileY + 1) * TILE_SIZE;

// The depth of the slice of the parent the item stands on. A parent drawn by
// rows has one depth per row, and the item takes the one of its own row.
const getParentDepth = (
    parent: PlacedRef,
    parentAsset: AssetRef,
    item: PlacedRef,
    mapHeightPx: number
): number => {
    const slices = buildPlacedSlices(
        parentAsset,
        getGroundBottomY(parent),
        mapHeightPx
    );
    const top = parent.tileY - parentAsset.footprint.h + 1;
    const row = clamp(item.tileY - top, 0, slices.length - 1);
    return slices[row]!.depth;
};

/**
 * Where a placed object is drawn. The anchor is the bottom left cell of the
 * footprint: the sprite starts `footprint.offsetX` tiles left of it and its
 * base sits at the bottom of that cell. An item on a desk rests on the top of
 * its parent, `surfaceHeightPx` above the cell, and draws just over the parent.
 * The pixel offset shifts the sprite and the solid footprint from the anchor
 * cell. Ground depth follows the shifted base, so draw order stays right. A
 * footprint with a mask draws the sprite in one slice per row, so an object
 * in a free tile of the footprint can sit between the rows.
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

        const depth =
            getParentDepth(parent, parentAsset, placed, mapHeightPx) +
            PLACED_ASSET_DEPTH.CHILD_STEP;
        return {
            x,
            bottomY:
                getGroundBottomY(placed) -
                parentAsset.surfaceHeightPx +
                placed.offsetY,
            depth,
            slices: [{ crop: null, depth }],
            solidRects: [],
        };
    }

    const bottomY = getGroundBottomY(placed) + placed.offsetY;

    return {
        x,
        bottomY,
        depth: getDepthAt(bottomY, mapHeightPx),
        slices: buildPlacedSlices(asset, bottomY, mapHeightPx),
        solidRects: asset.solid ? buildSolidRects(placed, asset.footprint) : [],
    };
};

// An asset plays its animation only when it has one and the animation was
// registered, which does not happen for a placeholder texture.
export const shouldPlayAnimation = (
    asset: Pick<AssetDefinition, "animation">,
    animationRegistered: boolean
): boolean => asset.animation !== null && animationRegistered;
