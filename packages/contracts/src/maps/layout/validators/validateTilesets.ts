import { MAX_TILESETS_PER_MAP } from "../../consts/constants";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutValidationResult,
} from "../issues";
import type { LayoutLibrary } from "../library";
import type { LooseLayout } from "../types/loose-layout";

export const validateTilesets = (
    layout: LooseLayout,
    library: LayoutLibrary
): LayoutValidationResult => {
    const result: LayoutValidationResult = { errors: [], warnings: [] };
    const tilesets = layout.tilesets ?? [];

    for (const tileset of tilesets) {
        if (!library.tilesets[tileset.name]) {
            result.errors.push(
                createIssue(
                    Code.TILESET_NOT_IN_LIBRARY,
                    tileset.name,
                    Messages.tilesetNotInLibrary
                )
            );
        }
    }

    if (tilesets.length > MAX_TILESETS_PER_MAP) {
        result.warnings.push(
            createIssue(
                Code.TOO_MANY_TILESETS,
                "tilesets",
                Messages.tooManyTilesets
            )
        );
    }

    return result;
};
