import { TILE_SIZE, WALL_TILE_PROPERTIES } from "@standin/contracts";
import type { MapLayout, TileMeta } from "@standin/contracts";
import type { CompletedLayout } from "../types/completed-layout";
import type { TilesetRow } from "../../assets/types";
import { buildFileUrl } from "../../../lib/buildFileUrl";

const TILED_FORMAT_VERSION = "1.10";

type TiledProperty ={ name: string; type: string; value: unknown };

// What a tile carries to the game: `solid` as before, and for a wall piece its
// collision mask (a JSON string), the rows it overlaps and the top it draws.
// A tile with none of them is left out, so a plain tileset adds nothing.
const buildTileProperties = (tile: TileMeta[string]): TiledProperty[] => {
    const properties: TiledProperty[] = [];
    if (tile.solid) {
        properties.push({
            name: WALL_TILE_PROPERTIES.SOLID,
            type: "bool",
            value: true,
        });
    }
    if (tile.solidMask) {
        properties.push({
            name: WALL_TILE_PROPERTIES.SOLID_MASK,
            type: "string",
            value: JSON.stringify(tile.solidMask),
        });
    }
    if (tile.overlap) {
        properties.push({
            name: WALL_TILE_PROPERTIES.OVERLAP,
            type: "int",
            value: tile.overlap,
        });
    }
    if (tile.top !== undefined) {
        properties.push({
            name: WALL_TILE_PROPERTIES.TOP,
            type: "int",
            value: tile.top,
        });
    }
    return properties;
};

/**
 * Fills the `tilesets` array of a stored layout (which only keeps `name` and
 * `firstgid`) with what Tiled and Phaser need: the image, the grid and the
 * tile properties (`solid`, and the wall mask, overlap and top), read from `tile_meta` and never stored. Tilesets
 * are served even when deleted, so spaces that use them keep rendering.
 */
export const completeLayout = async (
    layout: MapLayout,
    tilesets: Map<string, TilesetRow>
): Promise<CompletedLayout> => {
    const resolved = await Promise.all(
        layout.tilesets.flatMap((entry) => {
            const image = tilesets.get(entry.name);
            if (!image) return [];

            return [
                (async () => ({
                    tilesetName: entry.name,
                    url: buildFileUrl(image.fileId),
                    tiled: {
                        firstgid: entry.firstgid,
                        name: entry.name,
                        tilewidth: TILE_SIZE,
                        tileheight: TILE_SIZE,
                        tilecount: image.tileCount,
                        columns: image.columns,
                        margin: image.margin,
                        spacing: image.spacing,
                        image: image.fileName,
                        imagewidth: image.widthPx,
                        imageheight: image.heightPx,
                        tiles: Object.entries(image.tileMeta ?? {})
                            .map(([tileIndex, tile]) => ({
                                id: Number(tileIndex),
                                properties: buildTileProperties(tile),
                            }))
                            .filter(({ properties }) => properties.length > 0),
                    },
                }))(),
            ];
        })
    );

    return {
        layout: {
            ...layout,
            // Phaser reads `tiles[].properties` only when the version is
            // above 1, and otherwise drops them, so no tile would block.
            version: TILED_FORMAT_VERSION,
            tilesets: resolved.map(({ tiled }) => tiled),
        },
        tilesets: resolved.map(({ tilesetName, url }) => ({
            tilesetName,
            url,
        })),
    };
};
