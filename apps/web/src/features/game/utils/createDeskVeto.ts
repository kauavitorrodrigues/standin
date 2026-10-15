import { assertOpsInScope, EDIT_SCOPES } from "@standin/contracts";
import type { EditorModel, EditorOp } from "@standin/contracts";
import { DECORATOR_DESK_MESSAGES } from "@/features/game/consts/decorator-messages";
import { findOtherDeskClaim } from "@/features/game/utils/findOtherDeskClaim";

type Params = {
    userId: string;
    // The name of a person, or null while it is not known.
    getUserName: (userId: string) => string | null;
};

const getTargetIds = (op: EditorOp): (string | null | undefined)[] => {
    switch (op.type) {
        case "place_asset":
            return [op.parentId];
        case "move_asset":
            return [op.id, op.parentId];
        case "replace_asset":
        case "remove_asset":
            return [op.id];
        default:
            return [];
    }
};

// The refusal of the decorator for a list of operations, as the text of the
// hint, or null when the list may go. It asks the same rule the server applies
// (`assertOpsInScope`), so the interface never offers what would be refused.
// The text names the owner of the desk the operations touch.
export const createDeskVeto = ({ userId, getUserName }: Params) => {
    return (
        ops: readonly EditorOp[],
        model: Readonly<EditorModel>
    ): string | null => {
        const issues = assertOpsInScope(
            [...ops],
            { kind: EDIT_SCOPES.OBJECTS },
            { userId },
            model as EditorModel
        );
        if (issues.length === 0) return null;

        const claim = ops
            .flatMap(getTargetIds)
            .map((id) => findOtherDeskClaim(model, id, userId))
            .find((found) => found !== null);
        const owner =
            (claim && getUserName(claim.userId)) ||
            DECORATOR_DESK_MESSAGES.UNKNOWN_OWNER;

        return DECORATOR_DESK_MESSAGES.deskOf(owner);
    };
};
