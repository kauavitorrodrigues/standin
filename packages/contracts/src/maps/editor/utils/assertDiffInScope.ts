import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code, createIssue } from "../../layout/issues";
import type { LayoutIssue } from "../../layout/issues";
import { EDIT_SCOPES } from "../consts/edit-scopes";
import type { EditScope } from "../types/edit-scope";
import type { EditorModel } from "../types/editor-model";

/**
 * Second line of defense after the replay: in the `objects` scope the layout
 * of the model must come out exactly as it went in, so the diff to write
 * never touches `maps.layout`. Pure. An empty list means the diff is in scope.
 */
export const assertDiffInScope = (
    before: Pick<EditorModel, "layout">,
    after: Pick<EditorModel, "layout">,
    scope: EditScope
): LayoutIssue[] => {
    if (scope.kind !== EDIT_SCOPES.OBJECTS) return [];
    if (JSON.stringify(before.layout) === JSON.stringify(after.layout)) {
        return [];
    }

    return [createIssue(Code.OUT_OF_SCOPE, "layout", Messages.outOfScope)];
};
