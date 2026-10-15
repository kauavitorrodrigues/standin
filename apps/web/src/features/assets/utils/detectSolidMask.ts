import {
    ALPHA_OFFSET,
    RGBA_CHANNELS,
    SOLID_ALPHA_THRESHOLD,
    SOLID_CELL_PX,
    SOLID_COVERAGE_MIN,
} from "../consts/solidMask";
import type { Crop, Footprint } from "../types/spriteGeometry";
import { countSolidCells, getSolidGrid } from "./solidMask";
import { getFootprintRect } from "./spriteGeometry";

// The pixels of an image, in the shape of an ImageData.
export type PixelData = {
    width: number;
    height: number;
    data: ArrayLike<number>;
};

// How many pixels of a cell are drawn, from 0 to 1. Pixels outside the image
// count as empty.
const getCellCoverage = (
    pixels: PixelData,
    originX: number,
    originY: number
): number => {
    let drawn = 0;
    for (let y = originY; y < originY + SOLID_CELL_PX; y += 1) {
        for (let x = originX; x < originX + SOLID_CELL_PX; x += 1) {
            if (x < 0 || y < 0 || x >= pixels.width || y >= pixels.height) {
                continue;
            }
            const alpha =
                pixels.data[
                    (y * pixels.width + x) * RGBA_CHANNELS + ALPHA_OFFSET
                ];
            if (alpha >= SOLID_ALPHA_THRESHOLD) drawn += 1;
        }
    }
    return drawn / (SOLID_CELL_PX * SOLID_CELL_PX);
};

// The cells drawn by the art: a cell of the footprint is occupied when enough
// of its pixels are drawn, so the transparent parts of the image are left out.
// Null when no cell is drawn, since there is nothing to keep.
export const detectFootprintMask = (
    pixels: PixelData,
    frame: Crop,
    footprint: Footprint
): boolean[][] | null => {
    const origin = getFootprintRect(frame, footprint);
    const { cols, rows } = getSolidGrid(footprint);

    const cells = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
            const coverage = getCellCoverage(
                pixels,
                origin.x + col * SOLID_CELL_PX,
                origin.y + row * SOLID_CELL_PX
            );
            return coverage >= SOLID_COVERAGE_MIN;
        })
    );
    if (countSolidCells(cells) === 0) return null;
    return cells;
};
