import { MAX_MAP_TILES, MIN_MAP_TILES } from "../../consts/constants";
import { SIZE_TIERS, type SizeTier } from "../../consts/size-tiers";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LooseLayout } from "../types/loose-layout";

export const validateDimensions = (
    layout: LooseLayout,
    sizeTier: SizeTier | undefined
): LayoutIssue[] => {
    const errors: LayoutIssue[] = [];
    const { width = 0, height = 0 } = layout;

    if (width > MAX_MAP_TILES || height > MAX_MAP_TILES) {
        errors.push(
            createIssue(
                Code.MAP_TOO_LARGE_GLOBAL,
                "width",
                Messages.tooLargeGlobal
            )
        );
    }
    if (width < MIN_MAP_TILES.width || height < MIN_MAP_TILES.height) {
        errors.push(
            createIssue(Code.MAP_TOO_SMALL, "width", Messages.tooSmall)
        );
    }
    if (sizeTier) {
        const tier = SIZE_TIERS[sizeTier];
        if (width > tier.maxWidth || height > tier.maxHeight) {
            errors.push(
                createIssue(
                    Code.TIER_DIMENSION_EXCEEDED,
                    "width",
                    Messages.tierDimensionExceeded(
                        sizeTier,
                        tier.maxWidth,
                        tier.maxHeight
                    )
                )
            );
        }
    }

    return errors;
};
