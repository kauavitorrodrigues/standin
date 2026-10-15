import {
    AssetCategoryResolutionError,
    CATEGORY_ERROR_CODES,
    CategoryInvalidIssue,
    CategoryRequiredIssue,
    resolveAssetCategory,
} from "@standin/contracts";
import type {
    AssetCategory,
    CreateAssetData,
    FootprintMask,
    LibraryIssue,
} from "@standin/contracts";
import type { ImageSize } from "../../../lib/types";
import { readFrameSize } from "./readFrameSize";
import {
    findActionParamsIssue,
    findFootprintIssue,
    findFootprintMaskIssue,
    resolveFootprintMasks,
} from "./ruleIssues";

export type AssetPlan = {
    errors: LibraryIssue[];
    // Set only when there are no errors.
    values: {
        category: AssetCategory;
        frame: { w: number; h: number };
        footprint: {
            w: number;
            h: number;
            offsetX: number;
            mask: FootprintMask | null;
            solidMask: FootprintMask | null;
        };
    } | null;
};

const findCategory = (
    data: CreateAssetData
): { category: AssetCategory | null; issue: LibraryIssue | null } => {
    try {
        return {
            category: resolveAssetCategory(data.type, data.category),
            issue: null,
        };
    } catch (error) {
        if (!(error instanceof AssetCategoryResolutionError)) throw error;
        return {
            category: null,
            issue:
                error.code === CATEGORY_ERROR_CODES.REQUIRED
                    ? new CategoryRequiredIssue(data.type)
                    : new CategoryInvalidIssue(data.category ?? ""),
        };
    }
};

/**
 * The rules of a new base asset that need no database: the category, the
 * action params, the frame size read from the PNG (a strip for an animated
 * asset) and the footprint against that frame. `size` is null when the PNG
 * itself was already refused.
 */
export const planAsset = (
    data: CreateAssetData,
    size: ImageSize | null
): AssetPlan => {
    const errors: LibraryIssue[] = [];

    const { category, issue: categoryIssue } = findCategory(data);
    if (categoryIssue) errors.push(categoryIssue);

    const footprint = {
        offsetX: 0,
        ...data.footprint,
        ...resolveFootprintMasks(data.footprint),
    };
    const maskIssue = findFootprintMaskIssue(footprint, data.animation != null);
    if (maskIssue) errors.push(maskIssue);
    const actionIssue = findActionParamsIssue(
        data.action ?? null,
        data.actionParams ?? null
    );
    if (actionIssue) errors.push(actionIssue);

    let frame: { w: number; h: number } | null = null;
    if (size) {
        const read = readFrameSize(size, data.animation?.frameCount ?? null);
        errors.push(...read.issues);
        frame = read.frame;
    }
    if (frame) {
        const footprintIssue = findFootprintIssue(footprint, frame);
        if (footprintIssue) errors.push(footprintIssue);
    }

    if (errors.length > 0 || !frame || !category) {
        return { errors, values: null };
    }
    return { errors, values: { category, frame, footprint } };
};
