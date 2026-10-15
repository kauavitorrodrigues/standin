import type { Cell } from "../types/cell";

/** Cells of a segment (Bresenham), from `a` to `b`, with no gaps on diagonals. */
export const lineCells = (a: Cell, b: Cell): Cell[] => {
    const [x1, y1] = b;
    let [x, y] = a;
    const dx = Math.abs(x1 - x);
    const dy = -Math.abs(y1 - y);
    const sx = x < x1 ? 1 : -1;
    const sy = y < y1 ? 1 : -1;
    let error = dx + dy;
    const cells: Cell[] = [];
    for (;;) {
        cells.push([x, y]);
        if (x === x1 && y === y1) {
            return cells;
        }
        const doubled = 2 * error;
        if (doubled >= dy) {
            error += dy;
            x += sx;
        }
        if (doubled <= dx) {
            error += dx;
            y += sy;
        }
    }
};
