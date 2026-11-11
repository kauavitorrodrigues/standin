import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code, createIssue } from "../../layout/issues";
import type { LayoutIssue } from "../../layout/issues";
import { EDIT_SCOPES } from "../consts/edit-scopes";
import type { EditActor } from "../types/edit-actor";
import type { EditScope } from "../types/edit-scope";
import type { EditorModel } from "../types/editor-model";

type DiffModel = Pick<EditorModel, "layout" | "placed">;

const sameValue = (a: unknown, b: unknown): boolean =>
    JSON.stringify(a) === JSON.stringify(b);

// An object whose params are set (or changed) in the diff. Going back to no
// params is allowed, because swapping an object for an asset with another
// behavior clears them.
const hasNewParams = (before: DiffModel, after: DiffModel): boolean => {
    const previous = new Map(
        before.placed.map(({ id, behaviorParams }) => [id, behaviorParams])
    );
    return after.placed.some(
        ({ id, behaviorParams }) =>
            behaviorParams !== null &&
            !sameValue(previous.get(id) ?? null, behaviorParams)
    );
};

/**
 * Second line of defense after the replay. In the `objects` scope the layout
 * of the model must come out exactly as it went in, so the diff to write
 * never touches `maps.layout`, and only an actor that `canEdit` may come out
 * with params it did not have. Pure. An empty list means the diff is in scope.
 */
export const assertDiffInScope = (
    before: DiffModel,
    after: DiffModel,
    scope: EditScope,
    actor: EditActor
): LayoutIssue[] => {
    if (scope.kind !== EDIT_SCOPES.OBJECTS) return [];

    if (JSON.stringify(before.layout) !== JSON.stringify(after.layout)) {
        return [createIssue(Code.OUT_OF_SCOPE, "layout", Messages.outOfScope)];
    }

    if (actor.canEdit !== true && hasNewParams(before, after)) {
        return [
            createIssue(Code.OUT_OF_SCOPE, "behavior", Messages.outOfScope),
        ];
    }

    return [];
};
