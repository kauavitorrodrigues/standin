// The level one step in (1) or out (-1) from the current one in an ordered
// list, or the same level for 0 and at the ends of the list. The current level
// may sit between two of the list (the wheel zooms continuously), then the step
// goes to the nearest level on that side. It is how the buttons of an editor
// step through its zoom levels.
export const getNextStep = <T extends number>(
    levels: readonly T[],
    current: number,
    direction: 1 | -1 | 0
): number => {
    switch (direction) {
        case 1:
            return levels.find((level) => level > current) ?? levels.at(-1)!;
        case -1:
            return levels.findLast((level) => level < current) ?? levels[0]!;
        default:
            return current;
    }
};
