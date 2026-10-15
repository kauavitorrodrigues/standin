import { z } from "zod/v4";
import { AssetErrorMessages } from "./consts/error-messages";
import {
    ASSET_COLOR_HEX_PATTERN,
    ASSET_COLOR_KEY_PATTERN,
    MAX_ASSET_COLOR_KEY_LENGTH,
} from "./consts/fields";

export const assetColorKeySchema = z
    .string({ error: AssetErrorMessages.colorKey.invalid })
    .max(MAX_ASSET_COLOR_KEY_LENGTH, {
        error: AssetErrorMessages.colorKey.invalid,
    })
    .regex(ASSET_COLOR_KEY_PATTERN, {
        error: AssetErrorMessages.colorKey.invalid,
    });

export const assetColorHexSchema = z
    .string({ error: AssetErrorMessages.colorHex.invalid })
    .regex(ASSET_COLOR_HEX_PATTERN, {
        error: AssetErrorMessages.colorHex.invalid,
    });

export const assetColorSchema = z.object({
    key: assetColorKeySchema,
    hex: assetColorHexSchema.transform((hex) => hex.toUpperCase()),
});
