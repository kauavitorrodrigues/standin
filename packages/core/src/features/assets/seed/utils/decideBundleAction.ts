import { SEED_ACTIONS } from "../types";
import type { SeedAction, SeedBundlePartRow } from "../types";
import { areSameBundleParts } from "./areSameBundleParts";

/** Unchanged when the parts match, create when there were none, otherwise update. */
export const decideBundleAction = (
    current: SeedBundlePartRow[],
    desired: SeedBundlePartRow[]
): SeedAction => {
    if (areSameBundleParts(current, desired)) return SEED_ACTIONS.UNCHANGED;
    return current.length === 0 ? SEED_ACTIONS.CREATE : SEED_ACTIONS.UPDATE;
};
