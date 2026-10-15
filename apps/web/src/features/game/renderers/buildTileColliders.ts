import type Phaser from "phaser";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import { WALL_TILE_COLLIDER_PREFIX } from "@/features/game/consts/wall-tile";
import type { SolidColliderPort } from "@/features/game/types/placed-sync";
import { buildWallTileRects } from "@/features/game/utils/buildWallTileRects";
import { buildWallTiles } from "@/features/game/utils/buildWallTiles";
import { readWallTileMeta } from "@/features/game/renderers/readWallTileMeta";

// One solid body group per wall tile that blocks, kept by `tile:<column>:<row>`
// so it stays apart from the ones of the objects and of the doors. A wall tile
// with a collision mask blocks only the marked cells, a solid one without a
// mask blocks the whole tile, and any other blocks nothing.
export const buildTileColliders = (
    tilemap: Phaser.Tilemaps.Tilemap,
    port: SolidColliderPort
): void => {
    buildWallTiles(
        tilemap.getLayer(LAYOUT_LAYER_NAMES.WALLS)?.data ?? [],
        (gid) => readWallTileMeta(tilemap, gid)
    ).forEach(({ column, row, meta }) => {
        const rects = buildWallTileRects(meta, column, row);
        if (rects.length === 0) return;

        port.set(`${WALL_TILE_COLLIDER_PREFIX}${column}:${row}`, rects);
    });
};
