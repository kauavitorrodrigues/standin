import type { DraftState } from "@/features/maps/__shared__/types/DraftState";
import type { DraftSummary } from "@/features/maps/__shared__/types/DraftSummary";
import { isSameValue } from "@/features/maps/__shared__/utils/isSameValue";

// What the user can see and publish. Limits and the palette follow from these.
const isSameAsBase = ({ base, draft }: DraftState): boolean =>
    isSameValue(base.layout, draft.layout) &&
    isSameValue(base.placed, draft.placed) &&
    isSameValue(base.desks, draft.desks);

// A draft that ended up equal to the published map has no changes, even with
// operations behind it (placing an object and removing it again).
export const getDraftSummary = (state: DraftState): DraftSummary => ({
    hasChanges: state.ops.length > 0 && !isSameAsBase(state),
    canUndo: state.undo.length > 0,
    canRedo: state.redo.length > 0,
});
