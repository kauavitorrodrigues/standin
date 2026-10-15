import {
    ASSET_COLOR_HEX_PATTERN,
    ASSET_COLOR_KEY_PATTERN,
} from "@standin/contracts";

type ColorErrors = { colorKey?: string; colorHex?: string };

// The key and the hex of a color go together: both empty or both valid.
export const validateColorPair = (values: {
    colorKey: string;
    colorHex: string;
}): ColorErrors => {
    const key = values.colorKey.trim();
    const hex = values.colorHex.trim();
    if (key === "" && hex === "") return {};

    const errors: ColorErrors = {};
    if (!ASSET_COLOR_KEY_PATTERN.test(key)) {
        errors.colorKey = "Use letras minúsculas, números e hífens.";
    }
    if (!ASSET_COLOR_HEX_PATTERN.test(hex)) {
        errors.colorHex = "Use o formato #RRGGBB.";
    }
    return errors;
};
