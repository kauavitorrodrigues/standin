import type { Footprint } from "../types/footprint";
import type { FootprintCell } from "../types/footprint-cell";

export const getFootprintCells = ({
    tileX,
    tileY,
    width,
    height,
}: Footprint): FootprintCell[] => {
    const cells: FootprintCell[] = [];

    for (let x = tileX; x < tileX + width; x++) {
        for (let y = tileY - height + 1; y <= tileY; y++) {
            cells.push({ x, y });
        }
    }

    return cells;
};
