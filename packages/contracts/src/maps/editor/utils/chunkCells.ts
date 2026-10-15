import { MAX_CELLS_PER_OP } from "../consts/limits";
import type { Cell } from "../types/cell";

/** Splits a list of cells into blocks of at most `size` cells. */
export const chunkCells = (
    cells: Cell[],
    size: number = MAX_CELLS_PER_OP
): Cell[][] => {
    const chunks: Cell[][] = [];
    for (let start = 0; start < cells.length; start += size) {
        chunks.push(cells.slice(start, start + size));
    }
    return chunks;
};
