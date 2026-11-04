import type { SpaceHandRaise } from "../types/handRaise";

// The hand control only exists in the view of all participants.
export const handRaiseInGrid = (
    isGridView: boolean,
    handRaise: SpaceHandRaise | null
): SpaceHandRaise | null => {
    if (!isGridView) return null;
    return handRaise;
};
