import { TILE_SIZE } from "@standin/contracts";
import type { MapLayout } from "@standin/contracts";
import type { CompletedLayout } from "../types/completed-layout";
import type { TilesetRow } from "../../assets/types";
import { buildFileUrl } from "../../../lib/buildFileUrl";

const SOLID_PROPERTY = { name: "solid", type: "bool", value: true };

/**
 * Fills the `tilesets` array of a stored layout (which only keeps `name` and
 * `firstgid`) with what Tiled and Phaser need: the image, the grid and the
 * `solid` property per tile, read from `tile_meta` and never stored. Tilesets
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
                            .filter(([, tile]) => tile.solid)
                            .map(([tileIndex]) => ({
                                id: Number(tileIndex),
                                properties: [SOLID_PROPERTY],
                            })),
                    },
                }))(),
            ];
        })
    );

    return {
        layout: { ...layout, tilesets: resolved.map(({ tiled }) => tiled) },
        tilesets: resolved.map(({ tilesetName, url }) => ({
            tilesetName,
            url,
        })),
    };
};
