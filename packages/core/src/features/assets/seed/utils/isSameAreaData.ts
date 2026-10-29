import { stableJson } from "../../library/utils/stableJson";
import type { SeedAreaData } from "../types";

/** Whether the name and the stamp are the same, in any key order. */
export const isSameAreaData = (
    current: SeedAreaData,
    desired: SeedAreaData
): boolean =>
    current.name === desired.name &&
    stableJson(current.stamp) === stableJson(desired.stamp);
