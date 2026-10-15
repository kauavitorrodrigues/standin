import { TILE_SIZE } from "@standin/contracts";
import { getDepthAt } from "@/features/game/utils/buildPlacedSlices";
import type {
    WallTileDrawing,
    WallTileMeta,
    WallTileSlice,
} from "@/features/game/types/wall-tile";

// How a wall tile is drawn, on the same depth scale as the objects and the
// avatars, which follow the bottom of what they draw. The tile counts by its
// bottom edge, so an avatar behind a wall (above it on the map) goes under it
// and one in front goes over it.
//
// A top on the row above is part of the same wall and shares its depth, so the
// avatar that walks right behind the base is covered by the top too. A wall
// with no top and an overlap draws its upper rows as if the tile stood one row
// further down, which covers an avatar standing just in front.
export const buildWallTileDrawing = (
    meta: WallTileMeta,
    row: number,
    firstgid: number,
    mapHeightPx: number
): WallTileDrawing => {
    const baseDepth = getDepthAt((row + 1) * TILE_SIZE, mapHeightPx);

    if (meta.top !== null) {
        return {
            slices: [{ crop: null, depth: baseDepth }],
            top: { row: row - 1, gid: firstgid + meta.top, depth: baseDepth },
        };
    }

    const overlap = Math.min(meta.overlap, TILE_SIZE);
    if (overlap <= 0) {
        return { slices: [{ crop: null, depth: baseDepth }], top: null };
    }

    const upper: WallTileSlice = {
        crop: { y: 0, height: overlap },
        depth: getDepthAt((row + 2) * TILE_SIZE, mapHeightPx),
    };
    if (overlap >= TILE_SIZE) return { slices: [upper], top: null };

    return {
        slices: [
            {
                crop: { y: overlap, height: TILE_SIZE - overlap },
                depth: baseDepth,
            },
            upper,
        ],
        top: null,
    };
};
