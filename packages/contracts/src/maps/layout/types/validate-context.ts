import type { SizeTier } from "../../consts/size-tiers";
import type { LAYOUT_VALIDATION_LEVELS } from "../consts/validation-levels";

export type ValidationLevel =
    (typeof LAYOUT_VALIDATION_LEVELS)[keyof typeof LAYOUT_VALIDATION_LEVELS];

export type ValidateLayoutContext = {
    level: ValidationLevel;
    sizeTier?: SizeTier;
    // Rows of `map_assets` of the map, for the object limit.
    objectCount?: number;
};
