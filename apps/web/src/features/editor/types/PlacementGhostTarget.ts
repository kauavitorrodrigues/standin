import type { AssetDefinition } from "@standin/contracts";

// What the ghost needs to draw itself: the asset, where its sprite sits in
// pixels (left edge and bottom edge) and whether the spot is valid.
export type PlacementGhostTarget = {
    asset: AssetDefinition;
    x: number;
    bottomY: number;
    valid: boolean;
};
