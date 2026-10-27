import { walk, type Layout, type Point } from "./arrange";

// The share of people who move on each tick. The rest stand still, like most
// of a real space.
const WALKING_SHARE = 0.3;

/** Moves a random share of the people one step. */
export const arrangeWalkers = (
    ids: readonly string[],
    positions: Map<string, Point>,
    layout: Layout,
    rng: () => number
): void => {
    ids.forEach((id) => {
        if (rng() > WALKING_SHARE) return;
        const from = positions.get(id);
        if (from) positions.set(id, walk(from, layout, rng));
    });
};
