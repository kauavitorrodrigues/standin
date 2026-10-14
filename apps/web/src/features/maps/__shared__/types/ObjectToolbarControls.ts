import type { AssetDefinition, ReplaceAlternatives } from "@standin/contracts";

// What the bar of the selected object offers. Each flag says whether the
// control shows (spec 7.2), and `alternatives` is what the controls list.
export type ObjectToolbarControls = {
    // The asset the object has now.
    current: AssetDefinition;
    alternatives: ReplaceAlternatives;
    // The current model and its alternatives in one list, always in the order
    // of the library, so picking one never moves the others.
    modelChoices: AssetDefinition[];
    showModel: boolean;
    showColor: boolean;
    showRotate: boolean;
};
