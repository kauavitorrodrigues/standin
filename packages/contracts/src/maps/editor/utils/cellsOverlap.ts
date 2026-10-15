import { SOLID_MASK_SUBDIVISION } from "../../../assets/consts/library";
import { TILE_SIZE } from "../../consts/constants";
import type { FootprintCell } from "../types/footprint-cell";

const CELL_PX = TILE_SIZE / SOLID_MASK_SUBDIVISION;

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

// The cells of the other grid that a cell, moved by `shift` px, touches
// along one axis: one when it lines up with the grid, else the two it covers.
const touchedIndexes = (index: number, shift: number): number[] => {
    const at = index + shift / CELL_PX;
    return Number.isInteger(at) ? [at] : [Math.floor(at), Math.ceil(at)];
};

/**
 * True when the cells of `a`, drawn `shift` px away from where the cells of
 * `b` are drawn, cover at least one of them. Cells that only share an edge do
 * not overlap. With a shift of zero it is the same as `cellsOverlap`.
 */
export const cellsOverlapAtShift = (
    a: readonly FootprintCell[],
    b: readonly FootprintCell[],
    shift: { x: number; y: number }
): boolean => {
    const taken = new Set(b.map(cellKey));
    return a.some(({ x, y }) =>
        touchedIndexes(x, shift.x).some((column) =>
            touchedIndexes(y, shift.y).some((row) =>
                taken.has(cellKey({ x: column, y: row }))
            )
        )
    );
};
