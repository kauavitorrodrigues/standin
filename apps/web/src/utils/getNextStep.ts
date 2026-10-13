// The level one step in (1) or out (-1) from the current one in an ordered
// list, or the same level for 0 and at the ends of the list. It is how an
// editor steps through its zoom levels.
export const getNextStep = <T extends number>(
    levels: readonly T[],
    current: T,
    direction: 1 | -1 | 0
): T => {
    const index = levels.indexOf(current) + direction;
    const clamped = Math.min(Math.max(index, 0), levels.length - 1);

    return levels[clamped]!;
};
