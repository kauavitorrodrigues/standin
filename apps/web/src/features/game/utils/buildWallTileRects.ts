import { SOLID_MASK_SUBDIVISION, TILE_SIZE } from "@standin/contracts";
import type { WallTileMeta } from "@/features/game/types/wall-tile";
import { gridToRects } from "@/features/game/utils/buildSolidRects";
import type { PlacedRect } from "@/features/game/utils/placed";

// The rectangles, in px, that a wall tile blocks, from the top left corner of
// its cell. A collision mask blocks the cells it marks, so a trace of 4 px
// blocks the 8 px cell that holds it. With no mask a solid tile blocks the
// whole cell, and a tile that is neither blocks nothing.
export const buildWallTileRects = (
    meta: WallTileMeta,
    column: number,
    row: number
): PlacedRect[] => {
    const left = column * TILE_SIZE;
    const top = row * TILE_SIZE;

    if (meta.solidMask) {
        return gridToRects(
            {
                cells: meta.solidMask,
                cellPx: TILE_SIZE / SOLID_MASK_SUBDIVISION,
            },
            left,
            top
        );
    }
    if (!meta.solid) return [];

    return [{ x: left, y: top, width: TILE_SIZE, height: TILE_SIZE }];
};
