import {
    AVATAR_COLOR_KEY_MAX_LENGTH,
    AVATAR_COLOR_PATTERN,
} from "@standin/contracts";
import { AVATAR_PART_VALIDATION_MESSAGES as Messages } from "../../consts/messages";
import { normalizeColorHex } from "./normalizeColorHex";

type ColorPair = { colorKey: string; colorHex: string };

export type ColorPairIssues = { colorKey?: string; colorHex?: string };

// The problems of the color name and of the hex of a row. The two are both
// filled or both empty, and `required` says that empty is not an option, as in
// a new variation.
export const getColorPairIssues = (
    { colorKey, colorHex }: ColorPair,
    required: boolean
): ColorPairIssues => {
    const key = colorKey.trim();
    const hex = normalizeColorHex(colorHex);
    const isEmpty = key === "" && hex === "";
    if (isEmpty && !required) return {};

    const issues: ColorPairIssues = {};
    if (key === "") issues.colorKey = Messages.COLOR_KEY_REQUIRED;
    if (key.length > AVATAR_COLOR_KEY_MAX_LENGTH) {
        issues.colorKey = Messages.COLOR_KEY_TOO_LONG;
    }
    if (hex === "") issues.colorHex = Messages.COLOR_HEX_REQUIRED;
    if (hex !== "" && !AVATAR_COLOR_PATTERN.test(hex)) {
        issues.colorHex = Messages.COLOR_HEX_INVALID;
    }
    return issues;
};
