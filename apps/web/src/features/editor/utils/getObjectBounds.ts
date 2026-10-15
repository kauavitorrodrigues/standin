import { TILE_SIZE, type PlacedAsset } from "@standin/contracts";
import { resolvePlacedLayout } from "@/features/game/utils/placed";
import type { ObjectBounds } from "@/features/editor/types/ObjectBounds";
import type { ObjectLookup } from "@/features/editor/types/ObjectLookup";
import { buildObjectShape } from "@/features/editor/utils/buildObjectShape";
import type { ObjectSurface } from "@/features/editor/types/ObjectSurface";

// The box the sprite of a placed object covers, by the same layout rule the
// renderer follows. The sprite size comes from its texture; until the texture
// loads the footprint size stands in, as the placeholder does. Null when the
// object cannot be laid out (asset or parent missing).
export const getObjectBounds = (
    placed: PlacedAsset,
    lookup: ObjectLookup,
    surface: ObjectSurface
): ObjectBounds | null => {
    const asset = lookup.assetsById.get(placed.assetId);
    if (!asset) return null;

    const layout = resolvePlacedLayout(
        placed,
        lookup.assetsById,
        lookup.placedById,
        lookup.mapHeightPx
    );
    if (!layout) return null;

    const frame = surface.getFrameSize(asset.id) ?? {
        width: asset.footprint.w * TILE_SIZE,
        height: asset.footprint.h * TILE_SIZE,
    };

    return {
        x: layout.x,
        y: layout.bottomY - frame.height,
        width: frame.width,
        height: frame.height,
        depth: layout.depth,
        slices: layout.slices,
        shape: buildObjectShape(placed, asset),
    };
};
