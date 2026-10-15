import type { PlacedAsset } from "@standin/contracts";

export type ModelDiffPlan = {
    layoutChanged: boolean;
    // Objects of the new model whose id is not in the old one (the id is a
    // tempId). A parent always comes before its children.
    inserts: PlacedAsset[];
    // Same id, but the asset, the position or the parent changed.
    updates: PlacedAsset[];
    // Ids of the old model that the new one no longer has.
    deletes: string[];
};
