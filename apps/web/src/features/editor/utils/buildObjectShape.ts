import {
    ASSET_PLACEMENTS,
    SOLID_MASK_SUBDIVISION,
    TILE_SIZE,
    type AssetDefinition,
    type PlacedAsset,
} from "@standin/contracts";
import type { ObjectShape } from "@/features/editor/types/ObjectBounds";
import { buildMaskOutline } from "@/features/editor/utils/buildMaskOutline";
import { buildSolidRects } from "@/features/game/utils/buildSolidRects";

// The shape of the cells a ground object occupies, in world px, by the same
// rule the renderer follows for its collision. Undefined when the footprint has
// no mask, since then the box is the shape, and for an object that is not on
// the ground, which does not sit by tiles.
export const buildObjectShape = (
    placed: PlacedAsset,
    asset: AssetDefinition
): ObjectShape | undefined => {
    const { mask, w, h } = asset.footprint;
    if (!mask || asset.placement !== ASSET_PLACEMENTS.GROUND) return undefined;

    const left = placed.tileX * TILE_SIZE + placed.offsetX;
    const top = (placed.tileY - h + 1) * TILE_SIZE + placed.offsetY;
    return {
        rects: buildSolidRects(placed, { w, h, mask, solidMask: null }),
        segments: buildMaskOutline(
            mask,
            left,
            top,
            TILE_SIZE / SOLID_MASK_SUBDIVISION
        ),
    };
};
