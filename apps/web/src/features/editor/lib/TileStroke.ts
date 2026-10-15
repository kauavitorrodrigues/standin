import { lineCells } from "@standin/contracts";
import type { Cell } from "@standin/contracts";

const keyOf = ([x, y]: Cell): string => `${x},${y}`;

// The cells a drag has covered so far. Between two pointer events it fills the
// line with lineCells, so a fast drag leaves no holes. A cell is kept once.
export class TileStroke {
    private readonly cells = new Map<string, Cell>();
    private last: Cell;

    constructor(start: Cell) {
        this.last = start;
        this.cells.set(keyOf(start), start);
    }

    // Takes the pointer to `cell` and answers the cells that were new.
    extend(cell: Cell): Cell[] {
        const added: Cell[] = [];
        for (const step of lineCells(this.last, cell)) {
            const key = keyOf(step);
            if (this.cells.has(key)) continue;
            this.cells.set(key, step);
            added.push(step);
        }
        this.last = cell;
        return added;
    }

    getCells(): Cell[] {
        return [...this.cells.values()];
    }
}
