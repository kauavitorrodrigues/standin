import type Phaser from "phaser";
import type { WallTileMeta } from "@/features/game/types/wall-tile";
import { parseWallTileProperties } from "@/features/game/utils/wallTile";

// The meta of a wall tile from the properties of its tile in the tileset of
// the tilemap.
export const readWallTileMeta = (
    tilemap: Phaser.Tilemaps.Tilemap,
    gid: number
): WallTileMeta => {
    const tileset = tilemap.tilesets.find(
        ({ firstgid, total }) => gid >= firstgid && gid < firstgid + total
    );

    const properties = tileset?.tileProperties as
        Record<number, Record<string, unknown>> | undefined;

    return parseWallTileProperties(
        tileset ? properties?.[gid - tileset.firstgid] : undefined
    );
};
