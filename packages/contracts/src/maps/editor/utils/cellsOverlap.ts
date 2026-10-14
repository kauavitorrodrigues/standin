import type { FootprintCell } from "../types/footprint-cell";

const cellKey = ({ x, y }: FootprintCell): string => `${x},${y}`;

/** True when the two lists share at least one cell. */
export const cellsOverlap = (
    a: readonly FootprintCell[],
    b: readonly FootprintCell[]
): boolean => {
    const taken = new Set(a.map(cellKey));
    return b.some((cell) => taken.has(cellKey(cell)));
};

/** True when every cell of `inner` is also in `outer`. */
export const cellsInside = (
    inner: readonly FootprintCell[],
    outer: readonly FootprintCell[]
): boolean => {
    const available = new Set(outer.map(cellKey));
    return inner.every((cell) => available.has(cellKey(cell)));
};
