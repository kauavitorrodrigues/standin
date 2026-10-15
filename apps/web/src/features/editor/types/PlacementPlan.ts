import type { AssetDefinition } from "@standin/contracts";
import type { PlacementResult } from "@/features/editor/types/PlacementReason";

// Where an asset would go for a given cursor cell, and whether it can. For a
// SURFACE item the tile is the cell snapped onto the top of the parent.
// Without a free pointer the tile is the cell and the offset is 0.
export type PlacementPlan = {
    asset: AssetDefinition | null;
    tileX: number;
    tileY: number;
    // Pixel shift from the anchor cell, 0 when snapped to the grid.
    offsetX: number;
    offsetY: number;
    parentId: string | null;
    result: PlacementResult;
};
