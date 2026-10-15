import type { AssetDefinition } from "@standin/contracts";

// What the ghost needs to draw itself: the asset, where its sprite sits in
// pixels (left edge and bottom edge) and whether the spot is valid.
export type PlacementGhostTarget = {
    asset: AssetDefinition;
    x: number;
    bottomY: number;
    valid: boolean;
    // A valid spot that works but is not the ideal one, such as a door whose
    // family has no rotation for the wall. Drawn amber instead of green.
    warning?: boolean;
};
