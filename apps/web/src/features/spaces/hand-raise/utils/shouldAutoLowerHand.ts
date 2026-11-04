import type { AutoLowerHandInput } from "../types/handRaise";

// The hand belongs to the view of all participants. Leaving it, for the
// office or the chat, puts the hand down.
export const shouldAutoLowerHand = ({
    isGridView,
    isRaised,
}: AutoLowerHandInput): boolean => !isGridView && isRaised;
