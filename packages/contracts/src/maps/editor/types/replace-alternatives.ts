import type { AssetDefinition } from "../../../assets/types";

// Assets a placed object can be swapped for, each list already filtered by
// canReplaceAsset. `rotations` holds the next existing rotation, or nothing.
export type ReplaceAlternatives = {
    colors: AssetDefinition[];
    rotations: AssetDefinition[];
    models: AssetDefinition[];
};
