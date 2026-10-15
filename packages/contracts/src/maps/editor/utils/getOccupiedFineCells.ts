import { SOLID_MASK_SUBDIVISION } from "../../../assets/consts/library";
import type { Footprint } from "../types/footprint";
import type { FootprintCell } from "../types/footprint-cell";
import { getFootprintCells } from "./getFootprintCells";

/**
 * The cells of the footprint the object occupies, SOLID_MASK_SUBDIVISION per
 * tile per side. A cell is at the tile x times the subdivision plus its column,
 * so two objects that share a tile still tell their cells apart. Without a
 * mask it is every cell of the rectangle.
 */
export const getOccupiedFineCells = (footprint: Footprint): FootprintCell[] => {
    const { mask, tileX, tileY, height } = footprint;
    const top = tileY - height + 1;
    const fine: FootprintCell[] = [];

    for (const { x, y } of getFootprintCells(footprint)) {
        for (let row = 0; row < SOLID_MASK_SUBDIVISION; row++) {
            for (let column = 0; column < SOLID_MASK_SUBDIVISION; column++) {
                const occupied =
                    !mask ||
                    mask[(y - top) * SOLID_MASK_SUBDIVISION + row]?.[
                        (x - tileX) * SOLID_MASK_SUBDIVISION + column
                    ];
                if (!occupied) continue;
                fine.push({
                    x: x * SOLID_MASK_SUBDIVISION + column,
                    y: y * SOLID_MASK_SUBDIVISION + row,
                });
            }
        }
    }
    return fine;
};
