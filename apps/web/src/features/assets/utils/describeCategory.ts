import {
    ASSET_CATEGORY_META,
    DEFAULT_CATEGORY_BY_TYPE,
    type AssetCategory,
} from "@standin/contracts";
import {
    ASSET_CATEGORY_DISPLAY_META,
    DEFAULT_CATEGORY_META,
} from "../consts/categoryMeta";
import type { CreateAssetFormValues } from "../types/createForm";

// The category of the piece, or what is still missing: a DECORATION chooses,
// every other type takes the category of the type.
export const describeCategory = ({
    type,
    category,
}: Pick<CreateAssetFormValues, "type" | "category">) => {
    if (category) {
        const meta = ASSET_CATEGORY_DISPLAY_META[category as AssetCategory];
        return { ...meta, value: meta.label };
    }
    const fallback = DEFAULT_CATEGORY_BY_TYPE[type];
    if (!fallback) {
        return { ...DEFAULT_CATEGORY_META, value: "Escolha uma categoria" };
    }
    return {
        ...ASSET_CATEGORY_DISPLAY_META[fallback],
        value: ASSET_CATEGORY_META[fallback].label,
    };
};
