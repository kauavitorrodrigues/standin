import type { LibraryPalette } from "../../../assets/types/library";
import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import {
    LAYOUT_ISSUE_CODES as Code,
    createIssue,
    type LayoutIssue,
} from "../../layout/issues";
import { StampSchema } from "../schemas/stamp.schema";
import type { Stamp } from "../types/stamp";
import { buildBlankEditorModel } from "./buildBlankEditorModel";
import { buildStampOps } from "./buildStampOps";
import { findUnavailableStampItems } from "./stamp/findUnavailableStampItems";
import { stampSchemaIssueCode } from "./stamp/stampSchemaIssueCode";

const isEmpty = (stamp: Stamp): boolean =>
    stamp.objects.length === 0 &&
    Object.values(stamp.layers).every((data) =>
        (data ?? []).every((tile) => tile === 0)
    );

/**
 * Every problem of a stamp: its structure (StampSchema), then the items the
 * library does not list, then the placement rules, by laying the stamp on a
 * blank model of its own size. An empty list means the stamp is valid.
 */
export const validateStamp = (
    stamp: unknown,
    library: LibraryPalette
): LayoutIssue[] => {
    const parsed = StampSchema.safeParse(stamp);
    if (!parsed.success) {
        return parsed.error.issues.map((issue) =>
            createIssue(
                stampSchemaIssueCode(issue),
                issue.path.join("."),
                issue.message
            )
        );
    }

    const value = parsed.data;
    if (isEmpty(value)) {
        return [createIssue(Code.STAMP_EMPTY, "stamp", Messages.stampEmpty)];
    }

    const unavailable = findUnavailableStampItems(value, library);
    if (unavailable.length > 0) return unavailable;

    const blank = buildBlankEditorModel({
        width: value.width,
        height: value.height,
        library,
    });
    let count = 0;
    const result = buildStampOps(blank, value, 0, 0, () => `stamp-${++count}`);

    return result.ok ? [] : result.errors;
};
