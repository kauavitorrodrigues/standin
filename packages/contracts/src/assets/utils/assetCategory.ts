import { ASSET_CATEGORIES } from "../enums/asset-category";
import type { AssetCategory } from "../enums/asset-category";
import { DEFAULT_CATEGORY_BY_TYPE } from "../enums/asset-category";
import type { ASSET_TYPES } from "../enums/asset-type";

type AssetType = keyof typeof ASSET_TYPES;

export const CATEGORY_ERROR_CODES = {
    REQUIRED: "CATEGORY_REQUIRED",
    INVALID: "CATEGORY_INVALID",
} as const;

export type CategoryErrorCode =
    (typeof CATEGORY_ERROR_CODES)[keyof typeof CATEGORY_ERROR_CODES];

export class AssetCategoryResolutionError extends Error {
    public readonly code: CategoryErrorCode;

    constructor(code: CategoryErrorCode, message: string) {
        super(message);
        this.code = code;
    }
}

const isCategory = (value: string): value is AssetCategory =>
    Object.hasOwn(ASSET_CATEGORIES, value);

/**
 * The category of an asset: the explicit one, or the default of its type.
 * Throws a validation error when the value is not a category or when there is
 * neither an explicit value nor a default (DECORATION).
 */
export const resolveAssetCategory = (
    type: AssetType,
    explicit?: string
): AssetCategory => {
    if (explicit !== undefined) {
        if (!isCategory(explicit)) {
            throw new AssetCategoryResolutionError(
                CATEGORY_ERROR_CODES.INVALID,
                `Category ${explicit} is not valid.`
            );
        }
        return explicit;
    }
    const fallback = DEFAULT_CATEGORY_BY_TYPE[type];
    if (!fallback) {
        throw new AssetCategoryResolutionError(
            CATEGORY_ERROR_CODES.REQUIRED,
            `Type ${type} has no default category, so the category is required.`
        );
    }
    return fallback;
};
