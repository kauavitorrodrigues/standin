import type { REPLACE_INCOMPATIBLE_DETAILS } from "../consts/replace-incompatible-details";
import type { LayoutIssueCode } from "../../layout/issues";

// A refusal detail of this file, or the reason canPlaceAsset gave when the new
// footprint does not fit.
export type ReplaceIncompatibleDetail =
    | (typeof REPLACE_INCOMPATIBLE_DETAILS)[keyof typeof REPLACE_INCOMPATIBLE_DETAILS]
    | LayoutIssueCode;
