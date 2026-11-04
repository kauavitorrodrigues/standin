import type { SpaceRaisedHand } from "@standin/contracts";

// The hands of the new list that were not in the previous one, by socket id.
// Someone who was already there, or whose hand went down, is not new.
export const findNewHands = (
    previous: readonly SpaceRaisedHand[],
    next: readonly SpaceRaisedHand[]
): SpaceRaisedHand[] => {
    const known = new Set(previous.map((hand) => hand.socketId));
    return next.filter((hand) => !known.has(hand.socketId));
};
