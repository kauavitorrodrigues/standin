import {
    DeskClaimedError,
    EDIT_SCOPES,
    LAYOUT_ISSUE_CODES,
    OutOfScopeError,
    assertOpsInScope,
} from "@standin/contracts";
import type {
    EditActor,
    EditScope,
    EditorModel,
    EditorOp,
} from "@standin/contracts";

// Scope and desk rules run before the replay, for the objects scope only. The
// map scope (the Studio) keeps its own behavior: the replay already asks for
// `releaseDesk` when a claimed desk goes away.
export const assertRequestInScope = (
    ops: EditorOp[],
    scope: EditScope,
    actor: EditActor,
    base: EditorModel
): void => {
    if (scope.kind !== EDIT_SCOPES.OBJECTS) return;

    const issues = assertOpsInScope(ops, scope, actor, base);
    if (issues.length === 0) return;

    if (issues.some(({ code }) => code === LAYOUT_ISSUE_CODES.OUT_OF_SCOPE)) {
        throw new OutOfScopeError();
    }
    throw new DeskClaimedError();
};
