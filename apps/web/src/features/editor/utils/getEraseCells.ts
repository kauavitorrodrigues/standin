import { rectCells } from "@standin/contracts";
import type { Cell } from "@standin/contracts";

type Params = {
    // Shift held when the eraser is used: the area between the corners.
    shift: boolean;
    start: Cell;
    end: Cell;
    // The cells the drag has covered, kept when Shift is not held.
    stroke: readonly Cell[];
};

// The cells an erase gesture removes: the whole rectangle between the press
// and the pointer with Shift, and what the drag went over without it.
export const getEraseCells = ({
    shift,
    start,
    end,
    stroke,
}: Params): readonly Cell[] => {
    if (shift) return rectCells(start, end);
    return stroke;
};
