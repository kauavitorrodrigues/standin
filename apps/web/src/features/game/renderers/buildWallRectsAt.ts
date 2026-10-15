import type Phaser from "phaser";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import type { WallRectsAt } from "@/features/game/utils/buildDoorSolidRects";
import { buildWallTileRects } from "@/features/game/utils/buildWallTileRects";
import { buildWallTiles } from "@/features/game/utils/buildWallTiles";
import { readWallTileMeta } from "@/features/game/renderers/readWallTileMeta";

// What each wall tile of the map blocks, by cell, for the doors that lock in
// the gaps between them.
export const buildWallRectsAt = (
    tilemap: Phaser.Tilemaps.Tilemap
): WallRectsAt => {
    const byCell = new Map<string, ReturnType<typeof buildWallTileRects>>();
    buildWallTiles(
        tilemap.getLayer(LAYOUT_LAYER_NAMES.WALLS)?.data ?? [],
        (gid) => readWallTileMeta(tilemap, gid)
    ).forEach(({ column, row, meta }) => {
        const rects = buildWallTileRects(meta, column, row);
        if (rects.length > 0) byCell.set(`${column},${row}`, rects);
    });

    return (column, row) => byCell.get(`${column},${row}`) ?? null;
};
