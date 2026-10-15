import {
    ASSET_CATEGORY_META,
    ASSET_PLACEMENTS,
    ASSET_TYPES,
    MIN_ANIMATION_FRAME_COUNT,
    type AssetCategory,
} from "@standin/contracts";
import { toMetaOptions } from "../utils/toMetaOptions";
import { ASSET_CATEGORY_DISPLAY_META } from "./categoryMeta";
import { ASSET_PLACEMENT_META } from "./placementMeta";
import { ASSET_TYPE_META } from "./typeMeta";
import type { CreateAssetFormValues } from "../types/createForm";

export const DEFAULT_CATEGORY_OPTION = "";

export const DEFAULT_FRAME_DURATION_MS = 100;

export const CREATE_ASSET_DEFAULT_VALUES: CreateAssetFormValues = {
    image: [],
    name: "",
    type: ASSET_TYPES.DECORATION,
    category: DEFAULT_CATEGORY_OPTION,
    placement: ASSET_PLACEMENTS.GROUND,
    solid: false,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
    footprintW: 1,
    footprintH: 1,
    footprintOffsetX: 0,
    colorKey: "",
    colorHex: "",
    isAnimated: false,
    frameCount: MIN_ANIMATION_FRAME_COUNT,
    frameDurationMs: DEFAULT_FRAME_DURATION_MS,
    loopForever: true,
    repeatCount: 0,
};

export const TYPE_OPTIONS = toMetaOptions(ASSET_TYPE_META);

export const PLACEMENT_OPTIONS = toMetaOptions(ASSET_PLACEMENT_META);

const CATEGORIES_IN_ORDER = (
    Object.keys(ASSET_CATEGORY_META) as AssetCategory[]
).sort((a, b) => ASSET_CATEGORY_META[a].order - ASSET_CATEGORY_META[b].order);

// Only a DECORATION asks for a category, so there is no "default" option.
export const CATEGORY_OPTIONS = CATEGORIES_IN_ORDER.map((category) => ({
    value: category,
    ...ASSET_CATEGORY_DISPLAY_META[category],
}));
