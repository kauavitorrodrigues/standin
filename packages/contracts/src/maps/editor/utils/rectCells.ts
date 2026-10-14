import type { Cell } from "../types/cell";

/** Cells of the rectangle between two corners, sorted by y and then x. */
export const rectCells = (a: Cell, b: Cell): Cell[] => {
    const minX = Math.min(a[0], b[0]);
    const maxX = Math.max(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxY = Math.max(a[1], b[1]);
    const cells: Cell[] = [];
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            cells.push([x, y]);
        }
    }
    return cells;
};
