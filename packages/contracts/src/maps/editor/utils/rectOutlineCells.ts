import type { Cell } from "../types/cell";
import { rectCells } from "./rectCells";

/** Cells on the border of the rectangle between two corners, sorted by y and then x. */
export const rectOutlineCells = (a: Cell, b: Cell): Cell[] => {
    const minX = Math.min(a[0], b[0]);
    const maxX = Math.max(a[0], b[0]);
    const minY = Math.min(a[1], b[1]);
    const maxY = Math.max(a[1], b[1]);
    return rectCells(a, b).filter(
        ([x, y]) => x === minX || x === maxX || y === minY || y === maxY
    );
};
