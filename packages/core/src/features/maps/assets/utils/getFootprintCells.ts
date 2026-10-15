import type { Cell, Footprint } from "../types/footprint";

export const getFootprintCells = ({
    tileX,
    tileY,
    width,
    height,
}: Footprint): Cell[] => {
    const cells: Cell[] = [];

    for (let x = tileX; x < tileX + width; x++) {
        for (let y = tileY - height + 1; y <= tileY; y++) {
            cells.push({ x, y });
        }
    }

    return cells;
};
