import { LAYOUT_ISSUE_MESSAGES as Messages } from "../../layout/consts/issue-messages";
import { LAYOUT_ISSUE_CODES as Code } from "../../layout/issues";
import { EDIT_SCOPES } from "../consts/edit-scopes";
import type { EditorOp } from "../schemas/editorOp.schema";
import type { EditActor } from "../types/edit-actor";
import type { EditScope } from "../types/edit-scope";
import type { EditorModel } from "../types/editor-model";
import type { ScopeIssue } from "../types/scope-issue";
import { getOpScopeIssues } from "./scope/getOpScopeIssues";

// Operations that change the map itself, not its objects.
const isMapLevelOp = (op: EditorOp): boolean => {
    switch (op.type) {
        case "paint":
        case "erase":
        case "paint_tiles":
        case "set_zone":
        case "remove_zone":
        case "set_background":
            return true;
        default:
            return false;
    }
};

// Keeps the parent of every object up to date while the list is read, so an
// object placed by the list itself (tempId) can be the parent of a later one.
const trackParents = (parents: Map<string, string | null>, op: EditorOp) => {
    switch (op.type) {
        case "place_asset":
            parents.set(op.tempId, op.parentId ?? null);
            break;
        case "move_asset":
            parents.set(op.id, op.parentId ?? null);
            break;
        case "remove_asset":
            parents.delete(op.id);
            break;
        default:
            break;
    }
};

/**
 * Checks the operations against the edit scope and the desk claims, before
 * any of them is applied. Pure. In the `objects` scope the tile, zone and
 * background operations are refused (OUT_OF_SCOPE). In any scope, moving,
 * replacing or removing a desk claimed by someone else, or an item on it, is
 * refused (DESK_CLAIMED), and so is removing the own desk without
 * `releaseDesk`. Returns every problem found, each with the `opIndex` of its
 * operation. An empty list means the operations may be replayed.
 */
export const assertOpsInScope = (
    ops: EditorOp[],
    scope: EditScope,
    actor: EditActor,
    model: EditorModel
): ScopeIssue[] => {
    const issues: ScopeIssue[] = [];
    const parents = new Map<string, string | null>(
        model.placed.map(({ id, parentId }) => [id, parentId])
    );

    for (const [opIndex, op] of ops.entries()) {
        if (scope.kind === EDIT_SCOPES.OBJECTS && isMapLevelOp(op)) {
            issues.push({
                opIndex,
                code: Code.OUT_OF_SCOPE,
                path: `op.${op.type}`,
                message: Messages.outOfScope,
            });
            continue;
        }

        for (const { code, path, message } of getOpScopeIssues(
            model,
            parents,
            actor,
            op
        )) {
            issues.push({ opIndex, code, path, message });
        }

        trackParents(parents, op);
    }

    return issues;
};
