import type { DraftState } from "@/features/editor/types/DraftState";
import type { PublishAttempt } from "@/features/maps/__shared__/types/publish-attempt";
import { isSameOps } from "@/features/maps/__shared__/utils/isSameOps";

// The request to send. A repeat of the last attempt over the same base and the
// same operations keeps its publishId. Any change to the draft is a new
// request, so a stored answer never stands in for different operations.
export const getPublishAttempt = (
    previous: PublishAttempt | null,
    state: DraftState,
    createId: () => string
): PublishAttempt => {
    const baseVersion = state.base.version;

    if (
        previous &&
        previous.baseVersion === baseVersion &&
        isSameOps(previous.ops, state.ops)
    ) {
        return previous;
    }

    return { publishId: createId(), baseVersion, ops: [...state.ops] };
};
