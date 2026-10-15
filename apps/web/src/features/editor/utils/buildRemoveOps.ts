import {
    getClaimedDesk,
    type EditorModel,
    type EditorOp,
} from "@standin/contracts";
import type { RemovePlan } from "@/features/editor/types/RemovePlan";

type Params = {
    model: Readonly<EditorModel>;
    ids: readonly string[];
    // True once the owner of a claimed desk was asked (W-OBJ-7): the removal
    // then carries `releaseDesk` instead of being held back.
    releaseDesks?: boolean;
};

// One remove_asset for each object of the list that exists. Removing a parent
// takes its children (SURFACE) or frees them (GROUND), so an id whose parent
// is also in the list is left out. A claimed desk is not removed without
// `releaseDesks`: its id goes to `claimedIds` for the confirmation.
export const buildRemoveOps = ({
    model,
    ids,
    releaseDesks = false,
}: Params): RemovePlan => {
    const chosen = new Set(ids);
    const plan: RemovePlan = { ops: [], claimedIds: [] };

    for (const placed of model.placed) {
        if (!chosen.has(placed.id)) continue;
        if (placed.parentId !== null && chosen.has(placed.parentId)) continue;

        const claimed = getClaimedDesk(model, placed.id) !== undefined;
        if (claimed && !releaseDesks) {
            plan.claimedIds.push(placed.id);
            continue;
        }

        const op: EditorOp = claimed
            ? { type: "remove_asset", id: placed.id, releaseDesk: true }
            : { type: "remove_asset", id: placed.id };
        plan.ops.push(op);
    }

    return plan;
};
