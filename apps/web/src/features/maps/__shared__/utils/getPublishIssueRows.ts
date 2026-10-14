import type { EditorModel, EditorOp, PublishIssue } from "@standin/contracts";
import type { PublishIssueRow } from "@/features/maps/__shared__/types/publish-issue-row";
import { describePublishIssue } from "@/features/maps/__shared__/utils/describePublishIssue";
import { getOpFocusCell } from "@/features/maps/__shared__/utils/getOpFocusCell";

// The errors of a 422 as lines. The operation of each one is found by its
// index in the list that was sent, and objects already in the map by the
// model the operations were applied on.
export const getPublishIssueRows = (
    issues: readonly PublishIssue[],
    ops: readonly EditorOp[],
    model: EditorModel
): PublishIssueRow[] =>
    issues.map((issue, index) => {
        const op = ops[issue.opIndex];
        const cell = getOpFocusCell(op, model.placed);
        return {
            key: `${issue.opIndex}-${issue.code}-${index}`,
            text: describePublishIssue(issue, op, cell),
            cell,
        };
    });
