import { TILE_SIZE } from "../../consts/constants";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../issues";
import type { LooseLayout } from "../types/loose-layout";

export const validateHeader = (layout: LooseLayout): LayoutIssue[] => {
    const errors: LayoutIssue[] = [];

    if (layout.orientation !== "orthogonal") {
        errors.push(
            createIssue(
                Code.MAP_NOT_ORTHOGONAL,
                "orientation",
                Messages.notOrthogonal
            )
        );
    }
    if (layout.infinite !== false) {
        errors.push(
            createIssue(Code.MAP_INFINITE, "infinite", Messages.infinite)
        );
    }
    if (layout.tilewidth !== TILE_SIZE || layout.tileheight !== TILE_SIZE) {
        errors.push(
            createIssue(
                Code.TILE_SIZE_MISMATCH,
                "tilewidth",
                Messages.tileSizeMismatch
            )
        );
    }

    return errors;
};
