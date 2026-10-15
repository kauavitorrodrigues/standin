import { SOLID_MASK_SUBDIVISION } from "@standin/contracts";
import {
    ALPHA_OFFSET,
    RGBA_CHANNELS,
    SOLID_ALPHA_THRESHOLD,
    SOLID_CELL_PX,
    SOLID_COVERAGE_MIN,
} from "@/features/assets/consts/solidMask";
import type { PixelData } from "@/features/assets/utils/detectSolidMask";

// The collision mask of a tile read from its art: a cell blocks when enough of
// its pixels are drawn, so a trace of 4 px at the edge of a tile blocks the
// 8 px cell that holds it. `top` is the row of the tile inside the image.
export const detectWallMask = (pixels: PixelData, top: number): boolean[][] =>
    Array.from({ length: SOLID_MASK_SUBDIVISION }, (_, row) =>
        Array.from({ length: SOLID_MASK_SUBDIVISION }, (_, column) => {
            let drawn = 0;
            for (let dy = 0; dy < SOLID_CELL_PX; dy += 1) {
                for (let dx = 0; dx < SOLID_CELL_PX; dx += 1) {
                    const x = column * SOLID_CELL_PX + dx;
                    const y = top + row * SOLID_CELL_PX + dy;
                    const alpha =
                        pixels.data[
                            (y * pixels.width + x) * RGBA_CHANNELS +
                                ALPHA_OFFSET
                        ];
                    if (alpha >= SOLID_ALPHA_THRESHOLD) drawn += 1;
                }
            }
            return (
                drawn / (SOLID_CELL_PX * SOLID_CELL_PX) >= SOLID_COVERAGE_MIN
            );
        })
    );

export const isWholeTile = (mask: boolean[][]): boolean =>
    mask.every((row) => row.every(Boolean));

export const isEmptyMask = (mask: boolean[][]): boolean =>
    mask.every((row) => row.every((cell) => !cell));
