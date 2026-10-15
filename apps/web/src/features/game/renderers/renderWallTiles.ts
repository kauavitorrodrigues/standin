import type Phaser from "phaser";
import { LAYOUT_LAYER_NAMES } from "@standin/contracts";
import type { WallTileMeta } from "@/features/game/types/wall-tile";
import { buildWallTiles } from "@/features/game/utils/buildWallTiles";
import { readWallTileMeta } from "@/features/game/renderers/readWallTileMeta";
import { WallTileRenderer } from "@/features/game/renderers/WallTileRenderer";

// Draws the tiles of the walls layer one by one, each at its own depth. The
// layer itself is not created (see the `skip` of `renderTileLayers`).
export const renderWallTiles = (
    scene: Phaser.Scene,
    tilemap: Phaser.Tilemaps.Tilemap,
    layers: readonly Phaser.Tilemaps.TilemapLayer[],
    // Where the meta of a tile comes from. The tileset of the tilemap by
    // default, the library in the editor.
    metaOf: (gid: number) => WallTileMeta = (gid) =>
        readWallTileMeta(tilemap, gid)
): WallTileRenderer => {
    const foreground =
        layers.find(
            ({ layer }) => layer.name === LAYOUT_LAYER_NAMES.FOREGROUND
        ) ?? null;
    const renderer = new WallTileRenderer(
        scene,
        tilemap,
        tilemap.heightInPixels,
        metaOf,
        foreground
    );

    buildWallTiles(
        tilemap.getLayer(LAYOUT_LAYER_NAMES.WALLS)?.data ?? [],
        metaOf
    ).forEach(({ column, row, gid }) => renderer.set(column, row, gid));

    return renderer;
};
