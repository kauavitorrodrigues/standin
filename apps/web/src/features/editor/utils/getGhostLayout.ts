import {
    ASSET_PLACEMENTS,
    TILE_SIZE,
    type AssetDefinition,
    type EditorModel,
} from "@standin/contracts";
import { resolvePlacedLayout } from "@/features/game/utils/placed";
import type { PlacementPlan } from "@/features/editor/types/PlacementPlan";

type GhostLayout = { x: number; bottomY: number };

// Where the ghost sprite sits, by the same rule the placed objects follow, so
// it shows exactly where the object would land. A SURFACE item with no top
// under the cursor is laid out as if it were on the ground.
export const getGhostLayout = (
    model: EditorModel,
    asset: AssetDefinition,
    plan: Pick<PlacementPlan, "tileX" | "tileY" | "offsetX" | "offsetY" | "parentId">
): GhostLayout | null => {
    const hasParent = plan.parentId !== null;
    const layoutAsset =
        asset.placement === ASSET_PLACEMENTS.SURFACE && !hasParent
            ? { ...asset, placement: ASSET_PLACEMENTS.GROUND }
            : asset;

    const assetsById = new Map(model.library.assets.map((a) => [a.id, a]));
    assetsById.set(layoutAsset.id, layoutAsset);
    const placedById = new Map(model.placed.map((p) => [p.id, p]));

    const layout = resolvePlacedLayout(
        {
            id: "ghost",
            assetId: asset.id,
            tileX: plan.tileX,
            tileY: plan.tileY,
            offsetX: plan.offsetX,
            offsetY: plan.offsetY,
            parentId: plan.parentId,
        },
        assetsById,
        placedById,
        model.height * TILE_SIZE
    );
    if (!layout) return null;

    return { x: layout.x, bottomY: layout.bottomY };
};
