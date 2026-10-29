import { stableJson } from "../../library/utils/stableJson";
import type { SeedBundlePartRow } from "../types";

// The order of the parts means nothing, so both sides are sorted to compare.
const normalize = (parts: SeedBundlePartRow[]): string =>
    stableJson(
        [...parts].sort((a, b) => stableJson(a).localeCompare(stableJson(b)))
    );

/** Whether both lists hold the same parts, in any order. */
export const areSameBundleParts = (
    current: SeedBundlePartRow[],
    desired: SeedBundlePartRow[]
): boolean => normalize(current) === normalize(desired);
