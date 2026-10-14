import type { PlacedAsset } from "@standin/contracts";

// What changed between two lists of placed objects. `replaced` are the ones
// whose asset changed (model, color or rotation), `moved` the ones that kept
// the asset but changed cell or parent.
export type PlacedDiff = {
    added: PlacedAsset[];
    moved: PlacedAsset[];
    replaced: PlacedAsset[];
    removed: string[];
};
