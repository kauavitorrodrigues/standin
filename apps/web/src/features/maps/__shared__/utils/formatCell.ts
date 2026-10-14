import type { Cell } from "@standin/contracts";

// Text of the coordinates readout. Empty when the cursor is off the map.
export const formatCell = (cell: Cell | null): string => {
    if (!cell) return "";
    return `x: ${cell[0]}  y: ${cell[1]}`;
};
